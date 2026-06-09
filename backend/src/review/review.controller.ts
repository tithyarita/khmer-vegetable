import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';

import { ReviewService } from './review.service';
import { ReviewDto } from './dto/review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // CREATE REVIEW
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: ReviewDto, @Req() req: any) {
    return this.reviewService.create(body, req.user.id);
  }

  // GET AVERAGE RATINGS FOR ALL PRODUCTS
  @Get('ratings')
  getAllProductRatings() {
    return this.reviewService.getAllProductRatings();
  }

  // GET ALL REVIEWS FOR A PRODUCT
  @Get('product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.reviewService.findByProduct(Number(productId));
  }

  // GET ALL REVIEWS BY A USER
  @UseGuards(JwtAuthGuard)
  @Get('user')
  findByUser(@Req() req: any) {
    return this.reviewService.findByUser(req.user.id);
  }

  // GET ALL REVIEWS FOR CURRENT PROVIDER
  @UseGuards(JwtAuthGuard)
  @Get('provider')
  findByProvider(@Req() req: any) {
    return this.reviewService.findByProvider(req.user.id);
  }

  // GET AGGREGATE RATINGS FOR ALL PRODUCTS
  @Get('ratings')
  getAllRatings() {
    return this.reviewService.getAllRatings();
  }

  // GET ONE REVIEW
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewService.findOne(Number(id));
  }

  // UPDATE REVIEW
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() body: ReviewDto, @Req() req: any) {
    return this.reviewService.update(Number(id), body, req.user.id);
  }

  // DELETE REVIEW
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.reviewService.remove(Number(id), req.user.id);
  }
}
