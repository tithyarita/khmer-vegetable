import { Controller, Post, Body, Get, Delete, Param } from '@nestjs/common';
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
  // GET ALL USERS (for table)
  // =========================
  @Get()
  async findAll() {
    return this.usersRepository.find({
      select: ['id', 'name', 'email', 'phone', 'role', 'createat'],
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
    const { name, email, phone, password, role } = body;

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
      role: role || 'customer',
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
      createat: newUser.createat,
    });

    return {
      message: 'Registration successful!',
      user: newUser,
    };
  }
}
