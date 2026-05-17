import { 
  Injectable, 
  ConflictException, 
  BadRequestException, 
  InternalServerErrorException, 
  Logger 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { users, UserRole } from './users.entity';
import { Admin } from '../admin/admin.entity';
import { Provider } from '../providers/providers.entity';
import { Customer } from '../customer/customer.entity';
import { Staff } from '../staff/staff.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

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

  async register(body: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: string;
  }) {
    const { name, email, phone, password, role } = body;
    if (!name || !email || !phone || !password) {
      throw new BadRequestException('All fields are required.');
    }
    const existing = await this.usersRepository.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already registered.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Normalize the role matching to be case-insensitive (handles 'provider' vs 'PROVIDER')
    const roleValues = Object.values(UserRole);
    const userRole = (role && roleValues.find(v => v.toString().toLowerCase() === role.toLowerCase())) 
      ? (roleValues.find(v => v.toString().toLowerCase() === role.toLowerCase()) as UserRole) 
      : UserRole.CUSTOMER;

    this.logger.log(`Registration Started: ${email} (Role: ${userRole})`);

    try {
      // Use a transaction to ensure records are created in both tables at the same time
      const savedUser = await this.usersRepository.manager.transaction(async (transactionalManager) => {
        // 1. Create the main user record
        const user = transactionalManager.create(users, {
          name,
          email,
          phone,
          password: hashedPassword,
          role: userRole,
        });

        const saved = await transactionalManager.save(user);

        // 2. Create the specialized record based on the role
        if (userRole === UserRole.ADMIN) {
          this.logger.log('Creating Admin record...');
          await transactionalManager.save(Admin, {
            user_id: saved.id,
            name: saved.name,
            email: saved.email,
            role: 'admin',
            password: saved.password,
            status: 'active',
          });
        } else if (userRole === UserRole.PROVIDER) {
          this.logger.log('Creating Provider record...');
          await transactionalManager.save(Provider, {
            user_id: saved.id,
            provider_name: saved.name,
            email: saved.email,
            password: saved.password,
            status: 'active',
          });
        } else if (userRole === UserRole.CUSTOMER) {
          this.logger.log('Creating Customer record...');
          await transactionalManager.save(Customer, { user_id: saved.id } as any);
        } else if (userRole === UserRole.STAFF) {
          this.logger.log('Creating Staff record...');
          await transactionalManager.save(Staff, { user_id: saved.id } as any);
        }

        return saved;
      });

      return { message: 'Registration successful!', user: savedUser };
    } catch (error) {
      this.logger.error('Registration transaction failed:', error.stack);
      throw new InternalServerErrorException('Failed to create user. Please try again later.');
    }
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<users | undefined> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      console.log('User not found for email:', email);
      return undefined;
    }
    console.log('User found:', user.email, 'Hashed password:', user.password);
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);
    if (isMatch) {
      return user;
    }
    return undefined;
  }

  async findByEmail(email: string): Promise<users | undefined> {
    const user = await this.usersRepository.findOne({ where: { email } });
    return user === null ? undefined : user;
  }

  async findProviderByUserId(userId: number): Promise<Provider | null> {
    return this.providerRepository.findOne({
      where: { user_id: userId },
    });
  }
}
