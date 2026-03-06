import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { GroupTeam } from './entities/group-team.entity';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { AdminGroupsController } from './admin-groups.controller';
import { Team } from '../teams/entities/team.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Group, GroupTeam, Team])],
  providers: [GroupsService],
  controllers: [GroupsController, AdminGroupsController],
  exports: [GroupsService, TypeOrmModule],
})
export class GroupsModule {}
