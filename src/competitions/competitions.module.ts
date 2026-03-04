import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Competition } from './entities/competition.entity';
import { CompetitionsService } from './competitions.service';
import { CompetitionsController } from './competitions.controller';
import { AdminCompetitionsController } from './admin-competitions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Competition])],
  providers: [CompetitionsService],
  controllers: [CompetitionsController, AdminCompetitionsController],
  exports: [CompetitionsService, TypeOrmModule],
})
export class CompetitionsModule {}
