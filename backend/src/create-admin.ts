import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { users, UserRole } from './users/users.entity';
import { Admin } from './admin/admin.entity';
import * as bcrypt from 'bcryptjs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersRepo = app.get(getRepositoryToken(users));
  const adminRepo = app.get(getRepositoryToken(Admin));

  const email = 'admin@example.com';
  const password = 'admin123';
  const name = 'Admin';
  const phone = '0123456789';

  // Check if admin user already exists
  let user = await usersRepo.findOne({ where: { email } });
  if (!user) {
    const hashedPassword = await bcrypt.hash(password, 10);
    user = usersRepo.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: UserRole.ADMIN,
    });
    user = await usersRepo.save(user);
    console.log('Admin user created:', email);
  } else {
    console.log('Admin user already exists:', email);
  }

  // Check if admin entity exists
  let admin = await adminRepo.findOne({ where: { user_id: user.id } });
  if (!admin) {
    admin = adminRepo.create({
      user_id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      status: 'active',
    });
    await adminRepo.save(admin);
    console.log('Admin entity created for user:', email);
  } else {
    console.log('Admin entity already exists for user:', email);
  }

  await app.close();
}

bootstrap();
