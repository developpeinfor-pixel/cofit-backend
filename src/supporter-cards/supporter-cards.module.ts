import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupporterCard } from './entities/supporter-card.entity';
import { Payment } from '../payments/entities/payment.entity';
import { SupporterCardsService } from './supporter-cards.service';
import { SupporterCardsController } from './supporter-cards.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SupporterCard, Payment])],
  providers: [SupporterCardsService],
  controllers: [SupporterCardsController],
  exports: [SupporterCardsService, TypeOrmModule],
})
export class SupporterCardsModule {}
