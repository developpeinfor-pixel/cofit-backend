import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Standing } from './entities/standing.entity';
import { StandingsService } from './standings.service';
import { StandingsController } from './standings.controller';
import { AdminStandingsController } from './admin-standings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Standing])],
  providers: [StandingsService],
  controllers: [StandingsController, AdminStandingsController],
  exports: [StandingsService, TypeOrmModule],
})
export class StandingsModule {}
