import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { Player } from './entities/player.entity';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { AdminTeamsController } from './admin-teams.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Team, Player])],
  providers: [TeamsService],
  controllers: [TeamsController, AdminTeamsController],
  exports: [TeamsService, TypeOrmModule],
})
export class TeamsModule {}
