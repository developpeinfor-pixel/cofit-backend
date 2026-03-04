import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { Payment } from '../payments/entities/payment.entity';
import { SupporterCard } from '../supporter-cards/entities/supporter-card.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { Match } from '../matches/entities/match.entity';
import { Team } from '../teams/entities/team.entity';
import { Competition } from '../competitions/entities/competition.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Ticket,
      Payment,
      SupporterCard,
      Match,
      Team,
      Competition,
    ]),
  ],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
