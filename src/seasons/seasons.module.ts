import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Season } from './entities/season.entity';
import { SeasonsService } from './seasons.service';
import { SeasonsController } from './seasons.controller';
import { AdminSeasonsController } from './admin-seasons.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Season])],
  providers: [SeasonsService],
  controllers: [SeasonsController, AdminSeasonsController],
  exports: [SeasonsService, TypeOrmModule],
})
export class SeasonsModule {}
