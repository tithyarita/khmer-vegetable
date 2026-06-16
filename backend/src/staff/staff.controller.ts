import { Controller } from '@nestjs/common';
import {
  Body,
  Param,
  Get,
  Patch,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParseIntPipe } from '@nestjs/common';
import { Staff } from './staff.entity';
@Controller('staff')
export class StaffController {
  constructor(
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
  ) {}

  @Get(':id/profile')
  async getProfile(@Param('id', ParseIntPipe) userId: number) {
    const staff = await this.staffRepository.findOne({
      where: { user_id: userId },
    });
    if (!staff) throw new NotFoundException('Staff not found');
    return staff;
  }

  @Patch(':id/profile')
  async updateProfile(
    @Param('id', ParseIntPipe) userId: number,
    @Body() body: { name?: string; department?: string },
  ) {
    const update: Partial<Staff> = {};
    if (body.name?.trim()) update.name = body.name.trim();
    if (body.department?.trim()) update.department = body.department.trim();

    if (Object.keys(update).length === 0) {
      throw new BadRequestException('No valid fields provided');
    }

    await this.staffRepository.update({ user_id: userId }, update);

    const updated = await this.staffRepository.findOne({
      where: { user_id: userId },
    });
    if (!updated) throw new NotFoundException('Staff not found');

    return updated;
  }
}
