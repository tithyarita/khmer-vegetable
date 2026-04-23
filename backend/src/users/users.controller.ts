import { Controller, Post, Body } from '@nestjs/common';
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

  @Post('register')
  async register(
    @Body()
    body: {
      name: string;
      email: string;
      phone: string;
      password: string;
      role: string;
    },
  ) {
    const { name, email, phone, password } = body;

    // validation
    if (!name || !email || !phone || !password) {
      return { message: 'All fields are required.' };
    }

    // check email exists
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      return { message: 'Email already registered.' };
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const newUser = this.usersRepository.create({
      name,
      email,
      phone,
      role: 'customer',
      password: hashedPassword,
    });

    // save to MySQL ✅
    await this.usersRepository.save(newUser);

    // Log registration to backend console
    console.log('[REGISTER] New user:', {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
    });

    return {
      message: 'Registration successful!',
      user: newUser,
    };
  }
}
