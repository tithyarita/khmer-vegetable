import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './admin.entity';

@Controller('admins')
export class AdminController {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {}

  // GET ALL ADMINS
  @Get()
  async findAll() {
    return this.adminRepository.find();
  }

  // GET ADMIN BY user_id
  @Get(':user_id')
  async findOne(@Param('user_id', ParseIntPipe) user_id: number) {
    const admin = await this.adminRepository.findOne({
      where: { user_id },
    });

    if (!admin) {
      throw new NotFoundException(`Admin with user_id ${user_id} not found`);
    }

    return admin;
  }

  // CREATE ADMIN
  @Post()
  async create(@Body() body: Partial<Admin>) {
    const { user_id, email, password } = body;

    if (!user_id || !email || !password) {
      throw new BadRequestException(
        'user_id, email, and password are required',
      );
    }

    const admin = this.adminRepository.create(body);
    return this.adminRepository.save(admin);
  }

  // UPDATE ADMIN
  @Put(':user_id')
  async update(
    @Param('user_id', ParseIntPipe) user_id: number,
    @Body() body: Partial<Admin>,
  ) {
    const admin = await this.adminRepository.findOne({
      where: { user_id },
    });

    if (!admin) {
      throw new NotFoundException(`Admin with user_id ${user_id} not found`);
    }

    const updated = Object.assign(admin, body);
    return this.adminRepository.save(updated);
  }

  // DELETE ADMIN
  @Delete(':user_id')
  async remove(@Param('user_id', ParseIntPipe) user_id: number) {
    const result = await this.adminRepository.delete({ user_id });

    if (result.affected === 0) {
      throw new NotFoundException(`Admin with user_id ${user_id} not found`);
    }

    return { message: 'Admin deleted successfully' };
  }
}