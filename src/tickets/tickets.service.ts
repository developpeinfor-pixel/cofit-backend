import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { PurchaseTicketDto } from './dto/purchase-ticket.dto';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { Payment } from '../payments/entities/payment.entity';
import { TicketStatus } from '../common/enums/ticket-status.enum';
import { Match } from '../matches/entities/match.entity';
import { SupporterCard } from '../supporter-cards/entities/supporter-card.entity';
import { createHmac, timingSafeEqual } from 'crypto';

@Injectable()
export class TicketsService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(Match)
    private readonly matchesRepository: Repository<Match>,
    @InjectRepository(SupporterCard)
    private readonly supporterCardsRepository: Repository<SupporterCard>,
  ) {}

  private get qrSecret() {
    const secret =
      this.configService.get<string>('TICKET_QR_SECRET') ??
      this.configService.get<string>('JWT_SECRET');
    if (!secret || secret.trim().length === 0) {
      throw new InternalServerErrorException(
        'Ticket QR secret is not configured. Set TICKET_QR_SECRET or JWT_SECRET.',
      );
    }
    return secret;
  }

  private async nextTicketNumber(matchDate: string, matchId: string | null) {
    const key = matchId ?? matchDate;
    const count = await this.ticketsRepository.count({
      where: matchId ? { match_id: matchId } : { ticket_date: matchDate },
    });
    const serial = String(count + 1).padStart(6, '0');
    const datePart = matchDate.replaceAll('-', '');
    const keyPart = (key ?? '').replaceAll('-', '').substring(0, 8).toUpperCase();
    return `MC-${datePart}-${keyPart}-${serial}`;
  }

  private buildSignedQr(ticketNumber: string, matchDate: string, matchId?: string) {
    const data = `${ticketNumber}|${matchDate}|${matchId ?? ''}`;
    const payload = Buffer.from(data, 'utf8').toString('base64url');
    const signature = createHmac('sha256', this.qrSecret).update(payload).digest('hex');
    return `COFIT.${payload}.${signature}`;
  }

  private parseAndVerifyQr(qrCode: string) {
    if (!qrCode.startsWith('COFIT.')) {
      return null;
    }
    const parts = qrCode.split('.');
    if (parts.length != 3) {
      throw new BadRequestException('Invalid QR format');
    }
    const payload = parts[1];
    const givenSig = parts[2];
    const expectedSig = createHmac('sha256', this.qrSecret).update(payload).digest('hex');
    const ok =
      givenSig.length == expectedSig.length &&
      timingSafeEqual(Buffer.from(givenSig), Buffer.from(expectedSig));
    if (!ok) {
      throw new BadRequestException('QR signature is invalid');
    }
    const decoded = Buffer.from(payload, 'base64url').toString('utf8');
    const [ticketNumber, matchDate, matchId] = decoded.split('|');
    if (!ticketNumber || !matchDate) {
      throw new BadRequestException('QR payload is invalid');
    }
    return {
      ticketNumber,
      matchDate,
      matchId: matchId || undefined,
    };
  }

  async purchase(userId: string, dto: PurchaseTicketDto) {
    let targetMatch: Match | null = null;
    if (dto.match_id) {
      targetMatch = await this.matchesRepository.findOne({
        where: { id: dto.match_id },
      });
      if (!targetMatch) {
        throw new NotFoundException('Match not found');
      }
    }

    const ticketDate = dto.ticket_date ?? targetMatch?.match_date;
    if (!ticketDate) {
      throw new BadRequestException('ticket_date or match_id is required');
    }

    const dayMatches = await this.matchesRepository.find({
      where: { match_date: ticketDate },
      order: { kickoff_time: 'ASC' },
    });
    if (dayMatches.length === 0) {
      throw new BadRequestException('No match planned on this day');
    }

    if (!targetMatch && dto.match_id) {
      targetMatch = dayMatches.find((m) => m.id === dto.match_id) ?? null;
    }
    targetMatch = targetMatch ?? dayMatches[0] ?? null;
    if (!targetMatch) {
      throw new BadRequestException('No valid match found for ticket purchase');
    }

    const existing = await this.ticketsRepository.findOne({
      where: { user_id: userId, match_id: targetMatch.id },
    });
    if (existing) {
      throw new BadRequestException('Ticket already exists for this match');
    }

    const price = targetMatch.ticket_price ?? '0';
    const ticketNumber = await this.nextTicketNumber(ticketDate, targetMatch.id);
    const qrCode = this.buildSignedQr(ticketNumber, ticketDate, targetMatch.id);

    const ticket = this.ticketsRepository.create({
      user_id: userId,
      ticket_date: ticketDate,
      match_id: targetMatch.id,
      ticket_number: ticketNumber,
      qr_code: qrCode,
      amount: price,
      payment_status: PaymentStatus.SUCCESS,
      status: TicketStatus.ACTIVE,
    });
    const savedTicket = await this.ticketsRepository.save(ticket);

    const payment = this.paymentsRepository.create({
      user_id: userId,
      ticket_id: savedTicket.id,
      amount: price,
      provider: dto.provider,
      status: PaymentStatus.SUCCESS,
      external_reference: dto.external_reference,
    });
    await this.paymentsRepository.save(payment);

    return savedTicket;
  }

  findMine(userId: string) {
    return this.ticketsRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  findAllAdmin() {
    return this.ticketsRepository.find({
      order: { created_at: 'DESC' },
      take: 500,
    });
  }

  async getDayAccessMatches(userId: string, date: string) {
    const ticket = await this.ticketsRepository.findOne({
      where: {
        user_id: userId,
        ticket_date: date,
        payment_status: PaymentStatus.SUCCESS,
        status: TicketStatus.ACTIVE,
      },
    });

    const activeCard = await this.supporterCardsRepository.findOne({
      where: { user_id: userId, is_active: true },
      order: { created_at: 'DESC' },
    });

    const hasActiveCard =
      !!activeCard && activeCard.start_date <= date && activeCard.end_date >= date;

    if (!ticket && !hasActiveCard) {
      throw new BadRequestException('No valid ticket or supporter card for this day');
    }

    const matches = await this.matchesRepository.find({
      where: { match_date: date },
      order: { kickoff_time: 'ASC' },
    });

    return {
      date,
      access_granted: true,
      via: ticket ? 'ticket' : 'supporter_card',
      matches,
    };
  }

  async validateQr(qrCode: string) {
    let ticket: Ticket | null = null;
    const parsed = this.parseAndVerifyQr(qrCode);
    if (parsed) {
      ticket = await this.ticketsRepository.findOne({
        where: { ticket_number: parsed.ticketNumber },
      });
    } else {
      ticket = await this.ticketsRepository.findOne({ where: { qr_code: qrCode } });
    }
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    if (ticket.payment_status !== PaymentStatus.SUCCESS) {
      throw new BadRequestException('Ticket payment is not validated');
    }
    if (ticket.status !== TicketStatus.ACTIVE) {
      throw new BadRequestException('Ticket is not active');
    }
    ticket.status = TicketStatus.USED;
    await this.ticketsRepository.save(ticket);
    return {
      message: 'Ticket validated',
      ticket_id: ticket.id,
      ticket_number: ticket.ticket_number,
      match_id: ticket.match_id,
      ticket_date: ticket.ticket_date,
    };
  }
}
