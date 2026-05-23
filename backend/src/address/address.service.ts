import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Address } from './address.entity';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
  ) {}

  async getAddress(userId: number) {
    return await this.addressRepository.findOne({
      where: {
        user_id: userId,
      },
    });
  }

  async saveAddress(
    userId: number,
    body: Partial<Address> & { firstName?: string; lastName?: string },
  ) {
    let address = await this.addressRepository.findOne({
      where: {
        user_id: userId,
      },
    });

    if (!address) {
      address = new Address();
    }

    address.user_id = userId;

    address.first_name = body.firstName || '';
    address.last_name = body.lastName || '';

    address.street = body.street || '';

    address.city = body.city || '';
    address.state = body.state || '';
    address.zip = body.zip || '';

    address.country = body.country || '';

    address.phone = body.phone || '';

    address.email = body.email || '';

    return await this.addressRepository.save(address);
  }
}
