import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { SupporterCard } from '../supporter-cards/entities/supporter-card.entity';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Ticket, SupporterCard])],
  providers: [ProfileService],
  controllers: [ProfileController],
})
export class ProfileModule {}
