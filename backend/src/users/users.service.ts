import {
  Injectable,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { users, UserRole } from './users.entity'
import { Admin } from '../admin/admin.entity'
import { Provider } from '../providers/providers.entity'
import { Customer } from '../customer/customer.entity'
import { Staff } from '../staff/staff.entity'
import { CustomerStatus } from '../customer/customer.entity'
import * as bcrypt from 'bcryptjs'

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)

  constructor(
    @InjectRepository(users)
    private readonly usersRepository: Repository<users>,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
  ) {}

  // ================= REGISTER =================
  async register(body: {
    name: string
    email: string
    phone: string
    password: string
    role?: string
  }) {
    const { name, email, phone, password, role } = body

    if (!name || !email || !phone || !password) {
      throw new BadRequestException('All fields are required.')
    }

    const existing = await this.usersRepository.findOne({
      where: { email },
    })

    if (existing) {
      throw new ConflictException('Email already registered.')
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const roleValues = Object.values(UserRole)

    const userRole =
      (role &&
        roleValues.find(
          (v) => v.toString().toLowerCase() === role.toLowerCase(),
        )) ||
      UserRole.CUSTOMER

    this.logger.log(`Registering user: ${email} (${userRole})`)

    try {
      const savedUser = await this.usersRepository.manager.transaction(
        async (manager) => {
          const user = manager.create(users, {
            name,
            email,
            phone,
            password: hashedPassword,
            role: userRole,
          })

          const saved = await manager.save(user)

          // ================= ROLE TABLE CREATION =================
          if (userRole === UserRole.ADMIN) {
            await manager.save(Admin, {
              user_id: saved.id,
              name: saved.name,
              email: saved.email,
              password: saved.password,
              status: 'active',
            })
          }

          if (userRole === UserRole.PROVIDER) {
            await manager.save(Provider, {
              user_id: saved.id,
              provider_name: saved.name,
              email: saved.email,
              password: saved.password,
              status: 'active',
            })
          }

          if (userRole === UserRole.CUSTOMER) {
            await manager.save(Customer, {
              user_id: saved.id,
              name: saved.name,
              phone: saved.phone,
              status: CustomerStatus.ACTIVE,
            })
          }

          if (userRole === UserRole.STAFF) {
            await manager.save(Staff, {
              user_id: saved.id,
              name: saved.name,
              email: saved.email,
              password: saved.password,
              status: 'active',
            })
          }

          return saved
        },
      )

      return {
        message: 'Registration successful',
        user: savedUser,
      }
    } catch (err) {
      this.logger.error('Registration failed', err)
      throw new InternalServerErrorException('Registration failed')
    }
  }

  // ================= VALIDATE =================
  async validateUser(email: string, password: string) {
    const user = await this.usersRepository.findOne({ where: { email } })

    if (!user) return undefined

    const isMatch = await bcrypt.compare(password, user.password)

    return isMatch ? user : undefined
  }

  // ================= FIND BY EMAIL =================
  async findByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } })
  }

  // ================= FIND PROVIDER =================
  async findProviderByUserId(userId: number) {
    return this.providerRepository.findOne({
      where: { user_id: userId },
    })
  }

  // ================= DELETE USER (FIXED 500 ERROR) =================
  async remove(userId: number) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    try {
      await this.usersRepository.manager.transaction(async (manager) => {
        // 🔥 DELETE CHILD TABLES FIRST (PREVENT 500 ERROR)
        await manager.delete(Admin, { user_id: userId })
        await manager.delete(Provider, { user_id: userId })
        await manager.delete(Customer, { user_id: userId })
        await manager.delete(Staff, { user_id: userId })

        // 🔥 DELETE MAIN USER
        await manager.delete(users, { id: userId })
      })

      return {
        message: 'User deleted successfully',
        id: userId,
      }
    } catch (err) {
      this.logger.error('Delete failed', err)
      throw new InternalServerErrorException('Failed to delete user')
    }
  }
}