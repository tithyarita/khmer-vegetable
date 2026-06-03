import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import {
  ProviderApplication,
  ApplicationStatus,
} from './provider-application.entity';
import { CreateApplicationDto } from './dto/provider-application.dto';
import { users, UserRole } from '../users/users.entity';
import { Provider } from '../providers/providers.entity';
import * as bcrypt from 'bcryptjs';
import { MailService } from '../mail/mail.service';
import { Staff } from '../staff/staff.entity';

export interface UploadedFileUrls {
  id_document_path?: string;
  profile_photo_path?: string;
  farm_angle1_path?: string;
  farm_angle2_path?: string;
  farm_angle3_path?: string;
}

const DEFAULT_PASSWORD = 'user12345';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(ProviderApplication)
    private readonly repo: Repository<ProviderApplication>,

    @InjectRepository(users)
    private readonly usersRepo: Repository<users>,

    @InjectRepository(Provider)
    private readonly providerRepo: Repository<Provider>,

    @InjectRepository(Staff)
    private readonly staffRepo: Repository<Staff>,

    private readonly mailService: MailService,
  ) {}

  async create(
    dto: CreateApplicationDto,
    fileUrls: UploadedFileUrls,
  ): Promise<ProviderApplication> {
    const data: DeepPartial<ProviderApplication> = {
      business_name: dto.business_name,
      owner_name: dto.owner_name,
      contact_email: dto.contact_email,
      phone: dto.phone,
      village: dto.village,
      commune: dto.commune,
      district: dto.district,
      city_province: dto.city_province,
      primary_vegetable: dto.primary_vegetable,
      farm_category: dto.farm_category,
      application_status: ApplicationStatus.SUBMITTED,
      submitted_at: new Date(),
      id_document_path: fileUrls.id_document_path,
      profile_photo_path: fileUrls.profile_photo_path,
      farm_angle1_path: fileUrls.farm_angle1_path,
      farm_angle2_path: fileUrls.farm_angle2_path,
      farm_angle3_path: fileUrls.farm_angle3_path,
    };

    const application = this.repo.create(data);
    return this.repo.save(application);
  }

  async updateStatus(
    id: number,
    status: string,
    staffId?: number,
  ): Promise<ProviderApplication> {
    const app = await this.findOne(id);

    if (
      app.application_status === ApplicationStatus.APPROVED ||
      app.application_status === ApplicationStatus.REJECTED
    ) {
      throw new BadRequestException('Application has already been decided');
    }

    app.application_status = status as ApplicationStatus;

    // Save which staff reviewed it
    if (staffId) {
      const staffRecord = await this.staffRepo.findOne({
        where: { user_id: staffId },
      });
      if (staffRecord) {
        app.staff_reviewed_by = staffRecord;
      }
    }

    const saved = await this.repo.save(app);

    if (status === 'approved') {
      await this.createProviderAccount(app);
    }

    return saved;
  }

  private async createProviderAccount(app: ProviderApplication): Promise<void> {
    // Skip silently if this email already has an account
    const existing = await this.usersRepo.findOne({
      where: { email: app.contact_email },
    });
    if (existing) return;

    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    await this.usersRepo.manager.transaction(async (tx) => {
      // 1. Create users table record
      const user = tx.create(users, {
        name: app.owner_name,
        email: app.contact_email,
        phone: app.phone ?? '',
        password: hashedPassword,
        role: UserRole.PROVIDER,
      });
      const savedUser = await tx.save(user);

      // 2. Create provider table record
      await tx.save(Provider, {
        user_id: savedUser.id,
        provider_name: app.business_name,
        email: app.contact_email,
        password: hashedPassword,
        status: 'active',
      });

      // Send approval email — after transaction succeeds
      await this.mailService.sendProviderApproval({
        to: app.contact_email,
        ownerName: app.owner_name,
        businessName: app.business_name,
        password: DEFAULT_PASSWORD, // plain text for the email
        loginUrl: 'http://localhost:5173/provider/login', // change to your real domain in production
      });
    });
  }

  async findAll(search?: string): Promise<ProviderApplication[]> {
    if (!search || search.trim() === '') {
      return this.repo.find({
        order: { created_at: 'DESC' },
        relations: ['staff_reviewed_by'],
      });
    }

    const q = search.trim();

    return this.repo
      .createQueryBuilder('app')
      .leftJoinAndSelect('app.staff_reviewed_by', 'staff')
      .where('app.business_name LIKE :q', { q: `%${q}%` })
      .orWhere('app.owner_name LIKE :q', { q: `%${q}%` })
      .orWhere('CAST(app.id AS CHAR) LIKE :q', { q: `%${q}%` })
      .orderBy('app.created_at', 'DESC')
      .limit(20)
      .getMany();
  }

  async findOne(id: number): Promise<ProviderApplication> {
    const app = await this.repo.findOne({
      where: { id },
      relations: ['staff_reviewed_by'],
    });
    if (!app) throw new NotFoundException(`Application #${id} not found`);
    return app;
  }
}
