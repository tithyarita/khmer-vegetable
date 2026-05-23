import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './favorite.entity';
import { users } from '../users/users.entity';
import { Product } from '../product/product.entity';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
    @InjectRepository(users)
    private userRepository: Repository<users>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async getUserFavorites(userId: number): Promise<Favorite[]> {
    return this.favoriteRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'product'],
    });
  }

  async addToFavorite(userId: number, productId: number): Promise<Favorite> {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new Error('Product not found');
    }

    const existingFavorite = await this.favoriteRepository.findOne({
      where: { user: { id: userId }, product: { id: productId } },
      relations: ['user', 'product'],
    });

    if (existingFavorite) {
      return existingFavorite;
    }

    const favoriteItem = this.favoriteRepository.create({
      user: { id: userId } as any,
      product: product,
    } as any);

    return this.favoriteRepository.save(favoriteItem as any);
  }

  async removeFromFavorite(userId: number, productId: number): Promise<void> {
    const favoriteItem = await this.favoriteRepository.findOne({
      where: { user: { id: userId }, product: { id: productId } },
    });

    if (favoriteItem) {
      await this.favoriteRepository.remove(favoriteItem);
    }
  }

  async clearFavorites(userId: number): Promise<void> {
    const favorites = await this.getUserFavorites(userId);
    await this.favoriteRepository.remove(favorites);
  }
}
