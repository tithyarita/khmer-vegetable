import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

app.enableCors({
  origin: [
    'http://localhost:5173',
    'http://143.198.91.135'
  ],
  credentials: true,
});

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false, // IMPORTANT
    }),
  );

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/images',
  });

  await app.listen(3000);

  console.log('Server is running on http://localhost:3000');
}
bootstrap();
