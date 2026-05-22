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
  Patch,
  Query,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

import { ApplicationsService } from './provider-application.service';
import { CreateApplicationDto } from './dto/provider-application.dto';
import { ProviderApplication } from './provider-application.entity';

/** Multer storage — saves files under uploads/applications/ */
const storage = diskStorage({
  destination: './uploads/applications',
  filename: (_req, file, cb) => {
    cb(null, `${uuid()}${extname(file.originalname)}`);
  },
});

/** Allow only images + PDF */
const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: (error: Error | null, accept: boolean) => void,
) => {
  const allowed = /jpeg|jpg|png|pdf/;
  const ok =
    allowed.test(extname(file.originalname).toLowerCase()) &&
    allowed.test(file.mimetype);
  if (ok) cb(null, true);
  else
    cb(
      new BadRequestException('Only JPG, PNG, and PDF files are allowed'),
      false,
    );
};

@Controller('api/applications')
export class ApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

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
        storage,
        fileFilter,
        limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
      },
    ),
  )
  async create(
    @Body() body: Record<string, string>,
    // Fix error 1272: UploadedFiles decorator param typed with the multer namespace directly
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
    const dto = plainToInstance(CreateApplicationDto, body);
    const validationErrors = await validate(dto);
    if (validationErrors.length) {
      const messages = validationErrors
        .flatMap((e) => Object.values(e.constraints ?? {}))
        .join('; ');
      throw new BadRequestException(messages);
    }

    const saved = await this.service.create(dto, files ?? {});
    return {
      message: 'Application submitted successfully',
      id: saved.id,
      // Fix error 4053: reference the string value, not the enum type
      status: saved.application_status as string,
      submitted_at: saved.submitted_at,
    };
  }
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ): Promise<ProviderApplication> {
    return this.service.updateStatus(id, status);
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
