import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './cart.entity';
import { users } from '../users/users.entity';
import { Product } from '../product/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(users)
    private userRepository: Repository<users>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async getUserCart(userId: number): Promise<Array<Cart & { shipping: number }>> {
    const cartItems = await this.cartRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'product', 'product.provider'],
    });

    return cartItems.map((item) => ({
      ...item,
      shipping: 0,
    }));
  }

  async addToCart(
    userId: number,
    productId: number,
    quantity: number,
  ): Promise<Cart> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new Error('Product not found');
    }

    const existingCartItem = await this.cartRepository.findOne({
      where: { user: { id: userId }, product: { id: productId } },
      relations: ['user', 'product'],
    });

    if (existingCartItem) {
      existingCartItem.quantity += quantity;
      existingCartItem.unit_price = product.price as any;
      return this.cartRepository.save(existingCartItem);
    } else {
      const cartItem = this.cartRepository.create({
        user: { id: userId } as any,
        product: product,
        quantity: quantity,
        unit_price: product.price as any,
      } as any);
      return this.cartRepository.save(cartItem as any);
    }
  }

  async updateCartItem(
    userId: number,
    productId: number,
    quantity: number,
  ): Promise<any> {
    const cartItem = await this.cartRepository.findOne({
      where: { user: { id: userId }, product: { id: productId } },
      relations: ['user', 'product'],
    });

    if (!cartItem) {
      throw new Error('Cart item not found');
    }

    if (quantity <= 0) {
      return this.cartRepository.remove(cartItem);
    }

    cartItem.quantity = quantity;
    return this.cartRepository.save(cartItem);
  }

  async removeFromCart(userId: number, productId: number): Promise<void> {
    const cartItem = await this.cartRepository.findOne({
      where: { user: { id: userId }, product: { id: productId } },
    });

    if (cartItem) {
      await this.cartRepository.remove(cartItem);
    }
  }

  async clearCart(userId: number): Promise<void> {
    const cartItems = await this.getUserCart(userId);
    await this.cartRepository.remove(cartItems);
  }

  async getCartSummary(userId: number): Promise<any> {
    const cartItems = await this.getUserCart(userId);
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartItems.reduce(
      (sum, item) => sum + item.quantity * (item.unit_price as any),
      0,
    );

    return {
      items: cartItems,
      totalItems,
      totalPrice,
    };
  }
}
