
import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  Query,
  Put,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { users, UserRole } from './users.entity';
import { orders } from './orders.entity';
import { UsersService } from './users.service';
import * as bcrypt from 'bcryptjs';

@Controller('users')
export class UsersController {
  constructor(
    @InjectRepository(users)
    private readonly usersRepository: Repository<users>,
    @InjectRepository(orders)
    private readonly ordersRepository: Repository<orders>,
    private readonly usersService: UsersService,
  ) {}
  // =========================
  // UPDATE USER PROFILE
  // =========================
  @Put(':id')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, unique + extname(file.originalname));
        },
      }),
    })
  )
  async updateUser(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // Build update object manually to avoid type issues
    const update: any = {};
    if (body.name) update.name = body.name;
    if (body.email) update.email = body.email;
    if (body.phone) update.phone = body.phone;
    if (body.address) update.address = body.address;
    if (body.role) update.role = body.role;
    if (body.password) {
      const bcrypt = require('bcryptjs');
      update.password = await bcrypt.hash(body.password, 10);
    }
    if (file) {
      update.avatar = `/images/${file.filename}`;
    }
    await this.usersRepository.update(id, update);
    return await this.usersRepository.findOne({ where: { id: Number(id) } });
  }

  // =========================
  // GET USER ORDERS
  // =========================
  @Get(':id/orders')
  async getUserOrders(@Param('id') id: string) {
    return this.ordersRepository.find({ where: { customer_id: Number(id) } });
  }

  // =========================
  // GET USERS (ALL OR FILTER BY ROLE)
  // =========================
  @Get()
  async findAll(@Query('role') role?: string) {
    try {
      if (role && Object.values(UserRole).includes(role as UserRole)) {
        return await this.usersRepository.find({
          select: ['id', 'name', 'email', 'phone', 'role', 'created_at'],
          where: { role: role as UserRole },
          order: { id: 'ASC' },
        });
      }
      return await this.usersRepository.find({
        select: ['id', 'name', 'email', 'phone', 'role', 'created_at'],
        order: { id: 'ASC' },
      });
    } catch (error) {
      console.error('Error in /users:', error);
      throw error;
    }
  }

  // =========================
  // CLEAN PROVIDERS ENDPOINT (IMPORTANT)
  // =========================
  @Get('providers')
  async getProviders() {
    return this.usersRepository.find({
      where: { role: UserRole.PROVIDER },
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
    return this.usersService.register(body);
  }

  // =========================
  // CHANGE PASSWORD
  // =========================
  @Patch(':id/password')
  async changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,
  ) {
    if (!currentPassword || !newPassword) {
      throw new BadRequestException('Both currentPassword and newPassword are required');
    }
    return this.usersService.changePassword(id, currentPassword, newPassword);
  }
}
