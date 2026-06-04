import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

const config = new ConfigService();

cloudinary.config({
  cloud_name: config.get<string>('CLOUDINARY_CLOUD_NAME'),
  api_key: config.get<string>('CLOUDINARY_API_KEY'),
  api_secret: config.get<string>('CLOUDINARY_API_SECRET'),
});

export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (err, result) => {
        if (err || !result) return reject(err);
        resolve(result.secure_url);
      },
    );

    stream.end(buffer);
  });
}