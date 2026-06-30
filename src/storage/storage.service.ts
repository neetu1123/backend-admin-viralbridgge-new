import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { mkdir, writeFile } from 'fs/promises';
import { join, extname, dirname } from 'path';
import { randomUUID } from 'crypto';
import {
  getFirebaseBucket,
  isFirebaseConfigured,
} from '../firebase/firebase-admin.config';
import {
  DELIVERABLE_MAX_UPLOAD_BYTES,
  DELIVERABLE_THUMBNAIL_MIMES,
  DELIVERABLE_UPLOAD_MIMES,
} from './storage.constants';

export type UploadedFilePayload = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
};

export type UploadResult = {
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
  storage: 'firebase' | 'local';
  thumbnailUrl?: string;
};

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  async uploadDeliverable(params: {
    userId: string;
    file: UploadedFilePayload;
    thumbnail?: UploadedFilePayload;
    campaignId?: string;
  }): Promise<UploadResult> {
    this.assertAllowedFile(params.file, DELIVERABLE_UPLOAD_MIMES, 'file');
    if (params.thumbnail) {
      this.assertAllowedFile(params.thumbnail, DELIVERABLE_THUMBNAIL_MIMES, 'thumbnail');
    }

    const main = isFirebaseConfigured()
      ? await this.uploadToFirebase(params.userId, params.file, params.campaignId)
      : await this.uploadToLocal(params.userId, params.file, params.campaignId);

    if (params.thumbnail) {
      const thumb = isFirebaseConfigured()
        ? await this.uploadToFirebase(params.userId, params.thumbnail, params.campaignId, 'thumbnails')
        : await this.uploadToLocal(params.userId, params.thumbnail, params.campaignId, 'thumbnails');
      main.thumbnailUrl = thumb.url;
    }

    return main;
  }

  private assertAllowedFile(
    file: UploadedFilePayload,
    allowed: readonly string[],
    label: string,
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException(`${label} is required`);
    }
    if (file.size > DELIVERABLE_MAX_UPLOAD_BYTES) {
      const maxMb = Math.round(DELIVERABLE_MAX_UPLOAD_BYTES / (1024 * 1024));
      throw new BadRequestException(`${label} exceeds maximum size of ${maxMb}MB`);
    }
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException(
        `${label} type "${file.mimetype}" is not allowed. Allowed: ${allowed.join(', ')}`,
      );
    }
  }

  private sanitizeFileName(name: string): string {
    return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120) || 'file';
  }

  private buildObjectPath(
    userId: string,
    file: UploadedFilePayload,
    campaignId?: string,
    folder = 'files',
  ): string {
    const ext = extname(file.originalname) || this.extFromMime(file.mimetype);
    const safeName = this.sanitizeFileName(file.originalname.replace(ext, ''));
    const campaignPart = campaignId ? `${campaignId}/` : '';
    return `deliverables/${userId}/${campaignPart}${folder}/${Date.now()}-${randomUUID()}-${safeName}${ext}`;
  }

  private extFromMime(mime: string): string {
    const map: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
      'video/mp4': '.mp4',
      'video/webm': '.webm',
      'video/quicktime': '.mov',
    };
    return map[mime] ?? '';
  }

  private async uploadToFirebase(
    userId: string,
    file: UploadedFilePayload,
    campaignId?: string,
    folder = 'files',
  ): Promise<UploadResult> {
    const objectPath = this.buildObjectPath(userId, file, campaignId, folder);
    const bucket = getFirebaseBucket();
    const gcsFile = bucket.file(objectPath);

    await gcsFile.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
        metadata: {
          uploadedBy: userId,
          campaignId: campaignId ?? '',
        },
      },
      resumable: false,
    });

    try {
      await gcsFile.makePublic();
    } catch (error) {
      this.logger.warn(`Could not make ${objectPath} public; using signed-style public URL`);
    }

    const url = `https://storage.googleapis.com/${bucket.name}/${objectPath}`;

    return {
      url,
      fileName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      storage: 'firebase',
    };
  }

  private async uploadToLocal(
    userId: string,
    file: UploadedFilePayload,
    campaignId?: string,
    folder = 'files',
  ): Promise<UploadResult> {
    if (process.env.VERCEL) {
      throw new BadRequestException(
        'File upload requires Firebase Storage on Vercel. Set FIREBASE_SERVICE_ACCOUNT and FIREBASE_STORAGE_BUCKET.',
      );
    }

    const relativePath = this.buildObjectPath(userId, file, campaignId, folder);
    const absolutePath = join(process.cwd(), 'uploads', relativePath);
    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, file.buffer);

    const baseUrl =
      process.env.API_PUBLIC_URL?.replace(/\/$/, '') ||
      `http://localhost:${process.env.PORT ?? 4000}`;

    return {
      url: `${baseUrl}/uploads/${relativePath.replace(/\\/g, '/')}`,
      fileName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      storage: 'local',
    };
  }
}
