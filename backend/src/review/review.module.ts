import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewService } from './review.service'; // Fixed here (singular)
import { Review } from './review.entity';
import { ReviewController } from './review.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Review])],
  controllers: [ReviewController], // No controllers defined for this module
  providers: [ReviewService], // Fixed here (singular)
})
export class ReviewModule {}
