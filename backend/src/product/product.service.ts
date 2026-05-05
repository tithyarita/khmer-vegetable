import { Injectable, NotFoundException, Logger } from '@nestjs/common'
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

  // 🌐 Random image fallback
  async getRandomImage(): Promise<string> {
    const res = await firstValueFrom(
      this.httpService.get<{ message: string }>(
        'https://dog.ceo/api/breeds/image/random',
      ),
    )

    return res.data.message
  }

  // ➕ CREATE
  async create(data: Partial<Product>) {
    if (!data.imageUrl) {
      data.imageUrl = await this.getRandomImage()
    }

    const product = this.productRepository.create(data)
    const saved = await this.productRepository.save(product)

    this.logger.log(`Created product ID: ${saved.id}`)
    return saved
  }

  // 📦 FIND ALL
  async findAll() {
    const products = await this.productRepository.find()
    this.logger.log(`Loaded ${products.length} products`)
    return products
  }

  // 🔍 FIND ONE
  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
    })

    if (!product) {
      throw new NotFoundException('Product not found')
    }

    return product
  }

  // ✏️ UPDATE (FIXED)
  async update(id: number, data: Partial<Product>) {
    const product = await this.findOne(id)

    product.name = data.name ?? product.name
    product.price = data.price ?? product.price
    product.stock = data.stock ?? product.stock
    product.category = data.category ?? product.category
    product.description = data.description ?? product.description
    product.discount = data.discount ?? product.discount

    if (data.imageUrl) {
      product.imageUrl = data.imageUrl
    }

    const updated = await this.productRepository.save(product)

    this.logger.log(`Updated product ID: ${id}`)
    return updated
  }

  // ❌ DELETE
  async remove(id: number) {
    const product = await this.findOne(id)
    await this.productRepository.remove(product)

    this.logger.log(`Deleted product ID: ${id}`)

    return {
      message: 'Product deleted',
      id,
    }
  }
}