import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupporterCard } from './entities/supporter-card.entity';
import { SubscribeSupporterCardDto } from './dto/subscribe-supporter-card.dto';
import { Payment } from '../payments/entities/payment.entity';
import { PaymentStatus } from '../common/enums/payment-status.enum';

@Injectable()
export class SupporterCardsService {
  constructor(
    @InjectRepository(SupporterCard)
    private readonly supporterCardsRepository: Repository<SupporterCard>,
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
  ) {}

  async subscribe(userId: string, dto: SubscribeSupporterCardDto) {
    const today = new Date();
    const startDate = today.toISOString().slice(0, 10);
    const end = new Date(today);
    end.setFullYear(end.getFullYear() + 1);
    const endDate = end.toISOString().slice(0, 10);

    const cardCode = `SC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const qrCode = `SCQR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const card = this.supporterCardsRepository.create({
      user_id: userId,
      card_code: cardCode,
      qr_code: qrCode,
      start_date: startDate,
      end_date: endDate,
      is_active: true,
    });
    const savedCard = await this.supporterCardsRepository.save(card);

    const payment = this.paymentsRepository.create({
      user_id: userId,
      supporter_card_id: savedCard.id,
      amount: '0',
      provider: dto.provider,
      status: PaymentStatus.SUCCESS,
      external_reference: dto.external_reference,
    });
    await this.paymentsRepository.save(payment);

    return savedCard;
  }

  findMine(userId: string) {
    return this.supporterCardsRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async getActiveCardForUser(userId: string) {
    const today = new Date().toISOString().slice(0, 10);
    return this.supporterCardsRepository.findOne({
      where: { user_id: userId, is_active: true },
      order: { created_at: 'DESC' },
    }).then((card) => {
      if (!card) {
        return null;
      }
      if (card.end_date < today) {
        return null;
      }
      return card;
    });
  }

  async findOne(id: string) {
    const card = await this.supporterCardsRepository.findOne({ where: { id } });
    if (!card) {
      throw new NotFoundException('Supporter card not found');
    }
    return card;
  }
}
