import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly httpService: HttpService,
  ) {}

  // 🌐 Get random image from external API
  async getRandomImage(): Promise<string> {
    const response = await firstValueFrom(
      this.httpService.get<{ message: string }>(
        'https://dog.ceo/api/breeds/image/random',
      ),
    );

    return response.data.message;
  }

  // ➕ CREATE product
  async create(data: Partial<Product>) {
    try {
      // auto-generate image if not provided
      if (!data.imageUrl) {
        data.imageUrl = await this.getRandomImage();
      }

      const product = this.productRepository.create(data);
      const savedProduct = await this.productRepository.save(product);

      this.logger.log(`Product created with ID: ${savedProduct.id}`);
      console.log('Created product:', savedProduct);

      return savedProduct;
    } catch (error) {
      this.logger.error('Failed to create product', error);
      throw error;
    }
  }

  // 📦 GET ALL products
  async findAll() {
    try {
      const products = await this.productRepository.find();

      this.logger.log(`Loaded ${products.length} products`);
      console.log('All products:', products);

      return products;
    } catch (error) {
      this.logger.error('Failed to load products', error);
      throw error;
    }
  }

  // 🔍 GET ONE product
  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      this.logger.warn(`Product not found: ID ${id}`);
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  // ❌ DELETE product
  async remove(id: number) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);

    this.logger.log(`Deleted product ID: ${id}`);

    return {
      message: 'Product deleted successfully',
      id,
    };
  }

}