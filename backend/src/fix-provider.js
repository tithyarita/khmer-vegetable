import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { users } from './users/users.entity';
import { Provider } from './providers/providers.entity';
import * as bcrypt from 'bcryptjs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersRepo = app.get(getRepositoryToken(users));
  const providerRepo = app.get(getRepositoryToken(Provider));

  // Change these values as needed
  const userId = 3;
  const providerName = 'mingming';
  const email = 'mingming@gmail.com';
  const password = 'mingming123'; // Only used if creating a new user
  const status = 'active';

  // Ensure user exists
  let user = await usersRepo.findOne({ where: { id: userId } });
  if (!user) {
    const hashedPassword = await bcrypt.hash(password, 10);
    user = usersRepo.create({
      id: userId,
      name: providerName,
      email,
      password: hashedPassword,
      phone: '',
      role: 'provider',
    });
    user = await usersRepo.save(user);
    console.log('Created user:', email);
  }

  // Ensure provider exists
  let provider = await providerRepo.findOne({ where: { user_id: userId } });
  if (!provider) {
    provider = providerRepo.create({
      user_id: userId,
      provider_name: providerName,
      email,
      password: user.password,
      status,
    });
    await providerRepo.save(provider);
    console.log('Created provider for user:', email);
  } else {
    // Update provider name if needed
    provider.provider_name = providerName;
    provider.email = email;
    await providerRepo.save(provider);
    console.log('Updated provider for user:', email);
  }

  await app.close();
}

bootstrap();
