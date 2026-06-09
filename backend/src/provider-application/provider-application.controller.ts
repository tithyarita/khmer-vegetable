import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UploadedFiles,
  UseInterceptors,
  ParseIntPipe,
  BadRequestException,
  ConflictException,
  Patch,
  Query,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

import { ApplicationsService } from './provider-application.service';
import { CreateApplicationDto } from './dto/provider-application.dto';
import { ProviderApplication } from './provider-application.entity';
import { uploadToCloudinary } from '../cloudinary';

@Controller('api/applications')
export class ApplicationsController {
  constructor(private readonly service: ApplicationsService) {}
  @Get('check-email')
  async checkEmail(
    @Query('email') email?: string,
  ): Promise<{ exists: boolean }> {
    const formattedEmail = (email || '').trim().toLowerCase();

    if (!formattedEmail) {
      throw new BadRequestException('Email is required');
    }

    const exists = await this.service.checkEmailExists(formattedEmail);
    return { exists };
  }

  /**
   * POST /api/applications
   * Content-Type: multipart/form-data
   */
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'id_document', maxCount: 1 },
        { name: 'profile_photo', maxCount: 1 },
        { name: 'farm_angle1', maxCount: 1 },
        { name: 'farm_angle2', maxCount: 1 },
        { name: 'farm_angle3', maxCount: 1 },
      ],
      {
        storage: memoryStorage(),
        limits: { fileSize: 5 * 1024 * 1024 },
      },
    ),
  )
  async create(
    @Body() body: Record<string, string>,
    @UploadedFiles()
    files: {
      id_document?: Express.Multer.File[];
      profile_photo?: Express.Multer.File[];
      farm_angle1?: Express.Multer.File[];
      farm_angle2?: Express.Multer.File[];
      farm_angle3?: Express.Multer.File[];
    },
  ): Promise<{
    message: string;
    id: number;
    status: string;
    submitted_at: Date | null;
  }> {
    const email = (body.contact_email || '').trim().toLowerCase();
    if (email) {
      const emailExists = await this.service.checkEmailExists(email);
      if (emailExists) {
        throw new ConflictException(
          'An application has already been submitted with this email address.',
        );
      }
    }
    const dto = plainToInstance(CreateApplicationDto, body);
    const validationErrors = await validate(dto);
    if (validationErrors.length) {
      const messages = validationErrors
        .flatMap((e) => Object.values(e.constraints ?? {}))
        .join('; ');
      throw new BadRequestException(messages);
    }

    const uploadFile = async (
      f: Express.Multer.File[] | undefined,
      folder: string,
    ) => (f?.[0] ? await uploadToCloudinary(f[0].buffer, folder) : undefined);

    const fileUrls = {
      id_document_path: await uploadFile(
        files.id_document,
        'applications/id_document',
      ),
      profile_photo_path: await uploadFile(
        files.profile_photo,
        'applications/profile_photo',
      ),
      farm_angle1_path: await uploadFile(
        files.farm_angle1,
        'applications/farm_angle1',
      ),
      farm_angle2_path: await uploadFile(
        files.farm_angle2,
        'applications/farm_angle2',
      ),
      farm_angle3_path: await uploadFile(
        files.farm_angle3,
        'applications/farm_angle3',
      ),
    };

    const saved = await this.service.create(dto, fileUrls);
    return {
      message: 'Application submitted successfully',
      id: saved.id,
      status: saved.application_status,
      submitted_at: saved.submitted_at,
    };
  }
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
    @Body('staffId') staffId?: number,
  ): Promise<ProviderApplication> {
    return this.service.updateStatus(
      id,
      status,
      staffId ? +staffId : undefined,
    );
  }
  /** GET /api/applications?search= */
  @Get()
  findAll(@Query('search') search?: string): Promise<ProviderApplication[]> {
    return this.service.findAll(search);
  }

  /** GET /api/applications/:id */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ProviderApplication> {
    return this.service.findOne(id);
  }
}
