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
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: false, // ⚠️ false car tu as déjà tes tables
      }),
    }),
  ],
})
export class AppModule {}
