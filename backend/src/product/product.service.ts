import {
  Injectable,
  NotFoundException,
  Logger,
  ForbiddenException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Product } from './product.entity'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name)

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly httpService: HttpService,
  ) {}

  // ================= RANDOM IMAGE =================
  async getRandomImage(): Promise<string> {
    const res = await firstValueFrom(
      this.httpService.get<{ message: string }>(
        'https://dog.ceo/api/breeds/image/random',
      ),
    )
    return res.data.message
  }

  private resolveStockStatus(stock: number) {
    if (stock <= 0) {
      return 'Out of Stock'
    }

    if (stock < 10) {
      return 'Low Stock'
    }

    return 'In Stock'
  }

  // ================= CREATE =================
  async create(data: Partial<Product>, providerId: number) {
    if (!data.imageUrl) {
      data.imageUrl = await this.getRandomImage()
    }

    const product = this.productRepository.create({
      ...data,
      provider: { user_id: providerId },
    })

    product.status = this.resolveStockStatus(Number(product.stock || 0))

    return this.productRepository.save(product)
  }

  // ================= GET ALL =================
  async findAll(userId?: number, userRole?: string) {
    try {
      const products = await this.productRepository.find({
        relations: ['provider'],
        order: {
          id: 'DESC',
        },
      });

      this.logger.log(`[findAll] products count=${products.length}`);
      return products;
    } catch (error) {
      this.logger.error(`[findAll] Error fetching products:`, error.message);
      return [];
    }
  }

  // ================= GET BY PROVIDER =================
  async findByProvider(providerId: number) {
    try {
      const products = await this.productRepository.find({
        relations: ['provider'],
        where: {
          provider: { user_id: providerId },
        },
        order: {
          id: 'DESC',
        },
      });

      this.logger.log(`[findByProvider] providerId=${providerId} products count=${products.length}`);
      return products;
    } catch (error) {
      this.logger.error(`[findByProvider] Error fetching provider products:`, error.message);
      return [];
    }
  }

  // ================= GET ONE =================
  async findOne(id: number) {
    try {
      const product = await this.productRepository.findOne({
        where: { id },
        relations: ['provider'],
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      return product;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`[findOne] Error fetching product ${id}:`, error.message);
      throw error;
    }
  }

  // ================= UPDATE =================
  async update(
    id: number,
    data: Partial<Product>,
    userId: number,
    userRole: string,
  ) {
    const product = await this.findOne(id)

    const isAdmin = userRole === 'admin'
    const isOwner =
      product.provider?.user_id === userId

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException(
        'You cannot update this product',
      )
    }

    Object.assign(product, {
      name: data.name ?? product.name,
      price: data.price ?? product.price,
      stock: data.stock ?? product.stock,
      category: data.category ?? product.category,
      description:
        data.description ?? product.description,
      discount: data.discount ?? product.discount,
      imageUrl: data.imageUrl ?? product.imageUrl,
      weight: data.weight ?? product.weight,
    })

    product.status = this.resolveStockStatus(Number(product.stock || 0))

    return this.productRepository.save(product)
  }

  // ================= DELETE =================
  async remove(
    id: number,
    userId: number,
    userRole: string,
  ) {
    const product = await this.findOne(id)

    const isAdmin = userRole === 'admin'
    const isOwner =
      product.provider?.user_id === userId

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException(
        'You cannot delete this product',
      )
    }

    await this.productRepository.remove(product)

    return {
      message: 'Product deleted',
      id,
    }
  }
}