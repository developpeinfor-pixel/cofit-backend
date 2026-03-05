import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { AdminGroupsController } from './admin-groups.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Group])],
  providers: [GroupsService],
  controllers: [GroupsController, AdminGroupsController],
  exports: [GroupsService, TypeOrmModule],
})
export class GroupsModule {}
