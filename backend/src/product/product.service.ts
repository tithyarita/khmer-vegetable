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

  // ================= CREATE =================
  async create(data: Partial<Product>, providerId: number) {
    if (!data.imageUrl) {
      data.imageUrl = await this.getRandomImage()
    }

    const product = this.productRepository.create({
      ...data,
      provider: { user_id: providerId },
    })

    return this.productRepository.save(product)
  }

  // ================= GET ALL (FIXED ISOLATION) =================
  async findAll(userId: number, userRole: string) {
    const isAdmin = userRole === 'admin';
    const isCustomer = userRole === 'customer';

    // Customers and admins see all products; providers see only their own
    const products = await this.productRepository.find({
      where: isAdmin || isCustomer
        ? undefined
        : { provider: { user_id: userId } },
      relations: ['provider'],
    });

    // Debug logging
    this.logger.debug(`[findAll] userId=${userId} role=${userRole} products.length=${products.length}`);
    const missingProviders = products.filter(p => !p.provider);
    if (missingProviders.length > 0) {
      this.logger.warn(`[findAll] Products with missing provider: ${missingProviders.map(p => p.id).join(', ')}`);
    }

    return products;
  }

  // ================= GET ONE =================
  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['provider'],
    })

    if (!product) {
      throw new NotFoundException('Product not found')
    }

    return product
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
    })

    product.status =
      product.stock === 0
        ? 'Out of Stock'
        : product.stock < 10
        ? 'Low Stock'
        : 'In Stock'

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