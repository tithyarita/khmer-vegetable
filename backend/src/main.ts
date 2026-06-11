// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:8080',
      'http://143.198.91.135',
      'http://www.prave-vinuth.online',
    ],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  // Map both prefixes to the same physical folder
  const uploadPath = join(__dirname, '..', 'uploads');
  app.useStaticAssets(uploadPath, { prefix: '/uploads/' });
  app.useStaticAssets(uploadPath, { prefix: '/images/' });

  await app.listen(3000);
}
bootstrap();
