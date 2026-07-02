export const DELIVERABLE_UPLOAD_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
] as const;

export const DELIVERABLE_MAX_UPLOAD_BYTES =
  (Number(process.env.DELIVERABLE_MAX_UPLOAD_MB ?? 100) || 100) * 1024 * 1024;

export const DELIVERABLE_THUMBNAIL_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const PROFILE_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const PROFILE_MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
