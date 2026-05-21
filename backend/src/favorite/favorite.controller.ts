import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { FavoriteService } from './favorite.service';

@Controller('favorite')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Get(':userId')
  async getUserFavorites(@Param('userId', ParseIntPipe) userId: number) {
    return this.favoriteService.getUserFavorites(userId);
  }

  @Post('add')
  async addToFavorite(@Body() dto: { userId: number; productId: number }) {
    return this.favoriteService.addToFavorite(dto.userId, dto.productId);
  }

  @Delete('remove/:userId/:productId')
  async removeFromFavorite(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    await this.favoriteService.removeFromFavorite(userId, productId);
    return { message: 'Item removed from favorites successfully' };
  }

  @Delete('clear/:userId')
  async clearFavorites(@Param('userId', ParseIntPipe) userId: number) {
    await this.favoriteService.clearFavorites(userId);
    return { message: 'Favorites cleared successfully' };
  }
}
