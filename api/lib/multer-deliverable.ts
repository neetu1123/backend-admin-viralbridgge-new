import multer from 'multer';
import {
  DELIVERABLE_MAX_UPLOAD_BYTES,
  DELIVERABLE_THUMBNAIL_MIMES,
  DELIVERABLE_UPLOAD_MIMES,
} from '../../dist/src/storage/storage.constants';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: DELIVERABLE_MAX_UPLOAD_BYTES },
  fileFilter: (_req, file, cb) => {
    const allowed =
      file.fieldname === 'thumbnail'
        ? DELIVERABLE_THUMBNAIL_MIMES
        : DELIVERABLE_UPLOAD_MIMES;
    if (allowed.includes(file.mimetype as (typeof allowed)[number])) {
      cb(null, true);
      return;
    }
    cb(new Error(`File type "${file.mimetype}" is not allowed`));
  },
});

export const deliverableUploadMiddleware = upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 },
]);

export function toUploadPayload(file: Express.Multer.File) {
  return {
    buffer: file.buffer,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
  };
}
