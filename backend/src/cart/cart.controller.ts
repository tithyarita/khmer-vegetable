import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get(':userId')
  async getUserCart(@Param('userId', ParseIntPipe) userId: number) {
    return this.cartService.getUserCart(userId);
  }

  @Get('summary/:userId')
  async getCartSummary(@Param('userId', ParseIntPipe) userId: number) {
    return this.cartService.getCartSummary(userId);
  }

  @Post('add')
  async addToCart(@Body() addToCartDto: { userId: number; productId: number; quantity: number }) {
    return this.cartService.addToCart(addToCartDto.userId, addToCartDto.productId, addToCartDto.quantity);
  }

  @Put('update')
  async updateCartItem(@Body() updateCartDto: { userId: number; productId: number; quantity: number }) {
    return this.cartService.updateCartItem(updateCartDto.userId, updateCartDto.productId, updateCartDto.quantity);
  }

  @Delete('remove/:userId/:productId')
  async removeFromCart(@Param('userId', ParseIntPipe) userId: number, @Param('productId', ParseIntPipe) productId: number) {
    await this.cartService.removeFromCart(userId, productId);
    return { message: 'Item removed from cart successfully' };
  }

  @Delete('clear/:userId')
  async clearCart(@Param('userId', ParseIntPipe) userId: number) {
    await this.cartService.clearCart(userId);
    return { message: 'Cart cleared successfully' };
  }
}
