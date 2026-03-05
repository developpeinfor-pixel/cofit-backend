import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { VideosModule } from './videos/videos.module';
import { CompetitionsModule } from './competitions/competitions.module';
import { MatchesModule } from './matches/matches.module';
import { NewsModule } from './news/news.module';
import { PaymentsModule } from './payments/payments.module';
import { TicketsModule } from './tickets/tickets.module';
import { TeamsModule } from './teams/teams.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SupporterCardsModule } from './supporter-cards/supporter-cards.module';
import { StandingsModule } from './standings/standings.module';
import { ProfileModule } from './profile/profile.module';
import { HomeModule } from './home/home.module';
import { AdminModule } from './admin/admin.module';
import { SeasonsModule } from './seasons/seasons.module';
import { GroupsModule } from './groups/groups.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    VideosModule,
    CompetitionsModule,
    MatchesModule,
    NewsModule,
    PaymentsModule,
    TicketsModule,
    TeamsModule,
    NotificationsModule,
    SupporterCardsModule,
    StandingsModule,
    ProfileModule,
    HomeModule,
    AdminModule,
    SeasonsModule,
    GroupsModule,
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const useSsl =
          configService.get<string>('DB_SSL') === 'true' ||
          configService.get<string>('DB_SSL') === '1' ||
          configService.get<string>('NODE_ENV') === 'production';

        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: Number(configService.get<string>('DB_PORT') ?? 5432),
          username: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          ssl: useSsl ? { rejectUnauthorized: false } : false,
          autoLoadEntities: true,
          synchronize: false,
        };
      },
    }),
  ],
})
export class AppModule {}
