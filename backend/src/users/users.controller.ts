import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { users } from './users.entity';
import * as bcrypt from 'bcryptjs';

@Controller('users')
export class UsersController {
  constructor(
    @InjectRepository(users)
    private readonly usersRepository: Repository<users>,
  ) {}

  // =========================
  // GET USERS (ALL OR FILTER BY ROLE)
  // =========================
  @Get()
  async findAll(@Query('role') role?: string) {
    const query = this.usersRepository.createQueryBuilder('users');

    if (role) {
      query.where('users.role = :role', { role });
    }

    return query
      .select([
        'users.id',
        'users.name',
        'users.email',
        'users.phone',
        'users.role',
        'users.createat',
      ])
      .getMany();
  }

  // =========================
  // CLEAN PROVIDERS ENDPOINT (IMPORTANT)
  // =========================
  @Get('providers')
  async getProviders() {
    return this.usersRepository.find({
      where: { role: 'provider' },
    });
  }

  // =========================
  // DELETE USER
  // =========================
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.usersRepository.delete(id);
    return { message: 'User deleted successfully' };
  }

  // =========================
  // REGISTER USER
  // =========================
  @Post('register')
  async register(
    @Body()
    body: {
      name: string;
      email: string;
      phone: string;
      password: string;
      role?: string;
    },
  ) {
    const { name, email, phone, password, role } = body;

    if (!name || !email || !phone || !password) {
      return { message: 'All fields are required.' };
    }

    const existingUser = await this.usersRepository.findOne({
      where: { email: email },
    });

    if (existingUser) {
      return { message: 'Email already registered.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.usersRepository.create({
      name: name,
      email: email,
      phone: phone,
      role: role || 'customer',
      password: hashedPassword,
    });

    await this.usersRepository.save(newUser);

    return {
      message: 'Registration successful!',
      user: newUser,
    };
  }
}
