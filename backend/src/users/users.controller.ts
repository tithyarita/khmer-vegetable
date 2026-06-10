import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common'

import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'

import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcryptjs'

import { uploadToCloudinary } from '../cloudinary'

import { users, UserRole } from './users.entity'
import { orders } from './orders.entity'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  constructor(
    @InjectRepository(users)
    private readonly usersRepository: Repository<users>,

    @InjectRepository(orders)
    private readonly ordersRepository: Repository<orders>,

    private readonly usersService: UsersService,
  ) {}

  // =====================================================
  // UPDATE USER (CLOUDINARY UPLOAD)
  // =====================================================
  @Put(':id')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async updateUser(
    @Param('id', ParseIntPipe) userId: number,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    console.log('BODY:', body)

    const update: Partial<users> = {}

    // -------------------------
    // TEXT FIELDS
    // -------------------------
    if (body.name?.trim()) update.name = body.name
    if (body.email?.trim()) update.email = body.email
    if (body.phone?.trim()) update.phone = body.phone

    if (body.password?.trim()) {
      update.password = await bcrypt.hash(body.password, 10)
    }

    // -------------------------
    // AVATAR (CLOUDINARY)
    // -------------------------
    if (file) {
      update.avatar = await uploadToCloudinary(
        file.buffer,
        'users/avatars',
        file.originalname,
      )
    }

    // -------------------------
    // VALIDATION
    // -------------------------
    if (Object.keys(update).length === 0) {
      throw new BadRequestException('No valid fields provided')
    }

    // -------------------------
    // UPDATE DB
    // -------------------------
    await this.usersRepository.update(userId, update)

    const updated = await this.usersRepository.findOne({
      where: { id: userId },
    })

    if (!updated) {
      throw new NotFoundException('User not found')
    }

    return updated
  }

  // =====================================================
  // GET USER
  // =====================================================
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
    })

    if (!user) throw new NotFoundException('User not found')

    return user
  }

  // =====================================================
  // GET ALL USERS
  // =====================================================
  @Get()
  async findAll(@Query('role') role?: string) {
    return this.usersRepository.find({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        created_at: true,
        avatar: true,
      },
      where: role ? { role: role as UserRole } : {},
      order: { id: 'ASC' },
    })
  }

  // =====================================================
  // DELETE USER
  // =====================================================
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) userId: number) {
    await this.usersRepository.manager.query(
      'DELETE FROM cart WHERE user_id = $1',
      [userId],
    )

    await this.usersRepository.manager.query(
      'DELETE FROM favorite WHERE user_id = $1',
      [userId],
    )

    await this.usersRepository.manager.query(
      'DELETE FROM review WHERE user_id = $1',
      [userId],
    )

    await this.usersRepository.delete(userId)

    return { message: 'User deleted successfully' }
  }

  // =====================================================
  // USER ORDERS
  // =====================================================
  @Get(':id/orders')
  async getUserOrders(@Param('id', ParseIntPipe) id: number) {
    return this.ordersRepository.find({
      where: { customer_id: id },
      relations: {
        order_items: { product: true },
      },
      order: { id: 'DESC' },
    })
  }

  // =====================================================
  // REGISTER
  // =====================================================
  @Post('register')
  async register(@Body() body: any) {
    return this.usersService.register(body)
  }

  // =====================================================
  // PASSWORD CHANGE
  // =====================================================
  @Patch(':id/password')
  async changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body('currentPassword') cp: string,
    @Body('newPassword') np: string,
  ) {
    if (!cp || !np) {
      throw new BadRequestException('Passwords missing')
    }

    return this.usersService.changePassword(id, cp, np)
  }
}