import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { CreateReviewDto } from './dto/dto/create-review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
  ) {}

  async create(dto: CreateReviewDto): Promise<Review> {
    const review = this.reviewRepo.create({
      provider_id: dto.provider_id,
      customer_id: dto.customer_id,
      rating_stars: dto.rating_stars,
      feedback_text: dto.feedback_text ?? '',
    });

    return await this.reviewRepo.save(review);
  }

  async getProviderRatingSummary(providerId: number) {
    const reviews = await this.reviewRepo.find({
      where: { provider_id: providerId },
    });

    const total = reviews.length;
    if (total === 0) {
      return { totalReviews: 0, averageRating: 0 };
    }

    const sumOfRatings = reviews.reduce(
      (sum, r) => sum + (r.rating_stars || 0),
      0,
    );
    const averageRating = parseFloat((sumOfRatings / total).toFixed(1));

    return {
      totalReviews: total,
      averageRating: averageRating,
    };
  }
}
