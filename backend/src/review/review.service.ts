import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { Product } from '../product/product.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // CREATE REVIEW
  async create(data: Partial<Review>, userId: number) {
    const productId = (data as any).productId;

    // Check if product exists
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if user already reviewed this product
    const existingReview = await this.reviewRepository.findOne({
      where: {
        user: { id: userId },
        product: { id: productId },
      },
    });

    if (existingReview) {
      throw new ForbiddenException('You have already reviewed this product');
    }

    const review = this.reviewRepository.create({
      rating: data.rating,
      feedback: data.feedback,
      user: { id: userId },
      product: { id: productId },
    });

    return this.reviewRepository.save(review);
  }

  // GET AVERAGE RATINGS FOR ALL PRODUCTS
  async getAllProductRatings() {
    const rows = await this.reviewRepository
      .createQueryBuilder('review')
      .leftJoin('review.product', 'product')
      .select('product.id', 'productId')
      .addSelect('AVG(review.rating)', 'average')
      .addSelect('COUNT(review.id)', 'count')
      .groupBy('product.id')
      .getRawMany();

    return rows.map((row) => ({
      productId: Number(row.productId),
      average: Number(parseFloat(row.average).toFixed(1)) || 0,
      count: Number(row.count) || 0,
    }));
  }

  // GET ALL REVIEWS FOR A PRODUCT
  async findByProduct(productId: number) {
    return this.reviewRepository.find({
      where: { product: { id: productId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  // GET ALL REVIEWS BY A USER
  async findByUser(userId: number) {
    return this.reviewRepository.find({
      where: { user: { id: userId } },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
  }

  // GET ALL REVIEWS FOR A PROVIDER (products owned by the provider)
  async findByProvider(userId: number) {
    return this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.product', 'product')
      .leftJoinAndSelect('product.provider', 'provider')
      .where('provider.user_id = :userId', { userId })
      .orderBy('review.createdAt', 'DESC')
      .getMany();
  }

  // GET AGGREGATE RATINGS FOR ALL PRODUCTS
  async getAllRatings() {
    try {
      const result = await this.reviewRepository.query(
        `SELECT product_id AS productId, ROUND(AVG(rating), 1) AS average, COUNT(id) AS count
         FROM review
         WHERE product_id IS NOT NULL
         GROUP BY product_id`
      );
      return result.map((r: any) => ({
        productId: Number(r.productId),
        average: Number(r.average),
        count: Number(r.count),
      }));
    } catch (err) {
      console.error('getAllRatings error:', err);
      return [];
    }
  }

  // GET ONE REVIEW
  async findOne(id: number) {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['user', 'product'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  // UPDATE REVIEW
  async update(id: number, data: Partial<Review>, userId: number) {
    const review = await this.findOne(id);

    if (review.user.id !== userId) {
      throw new ForbiddenException('You can only update your own review');
    }

    Object.assign(review, data);
    return this.reviewRepository.save(review);
  }

  // DELETE REVIEW
  async remove(id: number, userId: number) {
    const review = await this.findOne(id);

    if (review.user.id !== userId) {
      throw new ForbiddenException('You can only delete your own review');
    }

    await this.reviewRepository.remove(review);
    return { message: 'Review deleted', id };
  }
}
