import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';

import { AddressService } from './address.service';

import { AuthGuard } from '@nestjs/passport';

@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getAddress(@Req() req: { user: { id: number } }) {
    const address = await this.addressService.getAddress(req.user.id);
    return address ?? {};
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async saveAddress(
    @Req() req: any,

    @Body() body: any,
  ) {
    return await this.addressService.saveAddress(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      req.user.id,

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      body,
    )
  }
}