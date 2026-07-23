import multer from 'multer';
import {
  PROFILE_IMAGE_MIMES,
  PROFILE_MAX_UPLOAD_BYTES,
} from '../../dist/src/storage/storage.constants';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: PROFILE_MAX_UPLOAD_BYTES },
  fileFilter: (_req, file, cb) => {
    if (PROFILE_IMAGE_MIMES.includes(file.mimetype as (typeof PROFILE_IMAGE_MIMES)[number])) {
      cb(null, true);
      return;
    }
    cb(new Error(`File type "${file.mimetype}" is not allowed`));
  },
});

export const profileUploadMiddleware = upload.single('image');

export function toProfileUploadPayload(file: Express.Multer.File) {
  return {
    buffer: file.buffer,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
  };
}
