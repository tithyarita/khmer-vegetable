import { Controller, Get, Post, Body, Req } from '@nestjs/common';

import { AddressService } from './address.service';

@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  async getAddress(@Req() req: { user: { id: number } }) {
    return await this.addressService.getAddress(req.user.id);
  }

  @Post()
  async saveAddress(@Req() req: any, @Body() body: any) {
    return await this.addressService.saveAddress(req.user.id, body);
  }
}
