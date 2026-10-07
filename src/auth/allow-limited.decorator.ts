import { SetMetadata } from '@nestjs/common';

export const ALLOW_LIMITED_KEY = 'allowLimited';
export const AllowLimited = () => SetMetadata(ALLOW_LIMITED_KEY, true);
