import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ReviewService } from './review.service'; // Fixed here (singular)
import { CreateReviewDto } from './dto/dto/create-review.dto'; // Fixed here (singular)

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {} // Fixed here (singular)

  @Post()
  async create(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewService.create(createReviewDto);
  }

  @Get('provider/:providerId')
  async getSummary(@Param('providerId', ParseIntPipe) providerId: number) {
    return this.reviewService.getProviderRatingSummary(providerId);
  }
}
