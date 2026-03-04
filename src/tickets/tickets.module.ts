import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Match } from '../matches/entities/match.entity';
import { SupporterCard } from '../supporter-cards/entities/supporter-card.entity';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { AdminTicketsController } from './admin-tickets.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, Payment, Match, SupporterCard])],
  providers: [TicketsService],
  controllers: [TicketsController, AdminTicketsController],
  exports: [TicketsService, TypeOrmModule],
})
export class TicketsModule {}
