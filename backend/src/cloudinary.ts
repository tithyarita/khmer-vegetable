import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join, extname, basename } from 'path';

const config = new ConfigService();
const cloudName = config.get<string>('CLOUDINARY_CLOUD_NAME');
const apiKey = config.get<string>('CLOUDINARY_API_KEY');
const apiSecret = config.get<string>('CLOUDINARY_API_SECRET');

const useCloudinary = Boolean(cloudName && apiKey && apiSecret);

if (useCloudinary) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  originalName = 'upload',
): Promise<string> {
  if (!useCloudinary) {
    const uploadsDir = join(__dirname, '..', 'uploads', folder);
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    const extension = extname(originalName) || '.jpg';
    const filename =
      String(Date.now()) + '-' + basename(originalName, extension) + extension;
    const filePath = join(uploadsDir, filename);
    await new Promise<void>((resolve, reject) => {
      const stream = createWriteStream(filePath);
      stream.on('error', reject);
      stream.on('finish', resolve);
      stream.end(buffer);
    });

    const relativePath = '/uploads/' + folder + '/' + filename;
    const host = process.env.APP_BASE_URL || 'http://localhost:3000';
    return host + relativePath;
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (err, result) => {
        if (err || !result) {
          return reject(
            err instanceof Error ? err : new Error('Cloudinary upload failed'),
          );
        }
        resolve(result.secure_url);
      },
    );

    stream.end(buffer);
  });
}
