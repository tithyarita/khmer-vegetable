import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { users } from './users.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(users)
    private readonly usersRepository: Repository<users>,
  ) {}

  async register(body: { name: string; email: string; phone: string; password: string }) {
    const { name, email, phone, password } = body;
    if (!name || !email || !phone || !password) {
      return { message: 'All fields are required.' };
    }
    const existing = await this.usersRepository.findOne({ where: { email } });
    if (existing) {
      return { message: 'Email already registered.' };
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({ name, email, phone, password: hashedPassword });
    await this.usersRepository.save(user);
    return { message: 'Registration successful!' };
  }

  async validateUser(email: string, password: string): Promise<users | undefined> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return undefined;
  }

  async findByEmail(email: string): Promise<users | undefined> {
    const user = await this.usersRepository.findOne({ where: { email } });
    return user === null ? undefined : user;
  }
}
