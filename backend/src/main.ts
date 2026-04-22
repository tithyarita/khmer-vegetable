import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*', // For development, allow all origins. Restrict in production.
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
