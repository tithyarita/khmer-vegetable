import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import {
  ProviderApplication,
  ApplicationStatus,
} from './provider-application.entity';
import { CreateApplicationDto } from './dto/provider-application.dto';

export interface UploadedFiles {
  id_document?: Express.Multer.File[];
  profile_photo?: Express.Multer.File[];
  farm_angle1?: Express.Multer.File[];
  farm_angle2?: Express.Multer.File[];
  farm_angle3?: Express.Multer.File[];
}

@Injectable()
export class ApplicationsService {
  [x: string]: any;
  constructor(
    @InjectRepository(ProviderApplication)
    private readonly repo: Repository<ProviderApplication>,
  ) {}

  async create(
    dto: CreateApplicationDto,
    files: UploadedFiles,
  ): Promise<ProviderApplication> {
    // Explicitly typed as DeepPartial<ProviderApplication> so TypeScript
    // picks the single-entity overload of repo.create(), not the array one.
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
      id_document_path: files.id_document?.[0]?.path,
      profile_photo_path: files.profile_photo?.[0]?.path,
      farm_angle1_path: files.farm_angle1?.[0]?.path,
      farm_angle2_path: files.farm_angle2?.[0]?.path,
      farm_angle3_path: files.farm_angle3?.[0]?.path,
    };

    const application = this.repo.create(data); // TS now picks the correct overload
    const saved = await this.repo.save(application); // save(entity) → entity, not array
    return saved;
  }

  async updateStatus(id: number, status: string): Promise<ProviderApplication> {
    const app = await this.findOne(id);
    app.application_status = status as ApplicationStatus;
    return this.repo.save(app);
  }

  async findAll(): Promise<ProviderApplication[]> {
    return this.repo.find({ order: { created_at: 'DESC' } });
  }

  async findOne(id: number): Promise<ProviderApplication> {
    const app = await this.repo.findOne({ where: { id } });
    if (!app) throw new NotFoundException(`Application #${id} not found`);
    return app;
  }
}
