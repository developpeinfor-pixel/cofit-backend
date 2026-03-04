import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { SupporterCard } from '../supporter-cards/entities/supporter-card.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,
    @InjectRepository(SupporterCard)
    private readonly supporterCardsRepository: Repository<SupporterCard>,
  ) {}

  async getMe(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [tickets, supporterCards] = await Promise.all([
      this.ticketsRepository.find({
        where: { user_id: userId },
        order: { ticket_date: 'DESC' },
      }),
      this.supporterCardsRepository.find({
        where: { user_id: userId },
        order: { created_at: 'DESC' },
      }),
    ]);

    const { password_hash, ...safeUser } = user;
    return {
      user: safeUser,
      tickets,
      supporter_cards: supporterCards,
      has_active_supporter_card:
        supporterCards.findIndex((card) => card.is_active) !== -1,
    };
  }
}
