import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const corsOrigins = configService.get<string>('CORS_ORIGINS');
  const parsedOrigins = corsOrigins
    ? corsOrigins
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
    : true;

  app.setGlobalPrefix('api/v1');
  app.enableCors({ origin: parsedOrigins });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // enlève les champs non définis dans le DTO
      forbidNonWhitelisted: true, // erreur si champ inconnu
      transform: true,
    }),
  );

  const port = configService.get<number>('PORT') ?? 3000;
  await app.listen(port);
}
bootstrap();
