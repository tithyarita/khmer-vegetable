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

  // 🌐 fallback image
  async getRandomImage(): Promise<string> {
    const res = await firstValueFrom(
      this.httpService.get<{ message: string }>(
        'https://dog.ceo/api/breeds/image/random',
      ),
    )
    return res.data.message
  }

  // ➕ CREATE PRODUCT
  async create(data: Partial<Product>, providerId?: number) {
    if (!data.imageUrl) {
      data.imageUrl = await this.getRandomImage()
    }

    // Set status based on stock
    let status = 'In Stock';
    if (typeof data.stock === 'number') {
      if (data.stock === 0) status = 'Out of Stock';
      else if (data.stock < 10) status = 'Low Stock';
    }

    const product = this.productRepository.create({
      ...data,
      status,
      provider: providerId ? { user_id: providerId } : undefined,
    })

    const saved = await this.productRepository.save(product)

    this.logger.log(`Created product ID: ${saved.id}`)
    return saved
  }

  // 📦 GET ALL PRODUCTS
  async findAll(providerId?: number) {
    const products = await this.productRepository.find({
      where: providerId ? { provider: { user_id: providerId } } : {},
      relations: ['provider'],
    })

    this.logger.log(
      `Loaded ${products.length} products (${
        providerId ? 'provider ' + providerId : 'ALL'
      })`,
    )

    return products
  }

  // 🔍 GET ONE PRODUCT
  async findOne(id: number, providerId?: number, userRole?: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['provider'],
    })

    if (!product) {
      throw new NotFoundException('Product not found')
    }

    // Allow admin to access any product
    if (providerId && product.provider?.user_id !== providerId && userRole !== 'admin') {
      throw new ForbiddenException('You do not own this product')
    }

    return product
  }

  // ✏️ UPDATE PRODUCT
  async update(id: number, data: Partial<Product>, providerId: number, userRole?: string) {
    const product = await this.findOne(id, providerId, userRole)

    Object.assign(product, {
      name: data.name ?? product.name,
      price: data.price ?? product.price,
      stock: data.stock ?? product.stock,
      category: data.category ?? product.category,
      description: data.description ?? product.description,
      discount: data.discount ?? product.discount,
      imageUrl: data.imageUrl ?? product.imageUrl,
    })

    // Update status based on new stock value
    if (typeof product.stock === 'number') {
      if (product.stock === 0) product.status = 'Out of Stock';
      else if (product.stock < 10) product.status = 'Low Stock';
      else product.status = 'In Stock';
    }

    const updated = await this.productRepository.save(product)

    this.logger.log(`Updated product ID: ${id}`)
    return updated
  }

  // ❌ DELETE PRODUCT
  async remove(id: number, providerId: number, userRole?: string) {
    const product = await this.findOne(id, providerId, userRole)

    await this.productRepository.remove(product)

    this.logger.log(`Deleted product ID: ${id}`)

    return {
      message: 'Product deleted',
      id,
    }
  }
}