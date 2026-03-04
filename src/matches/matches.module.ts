import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './entities/match.entity';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { AdminMatchesController } from './admin-matches.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Match])],
  providers: [MatchesService],
  controllers: [MatchesController, AdminMatchesController],
  exports: [MatchesService, TypeOrmModule],
})
export class MatchesModule {}
