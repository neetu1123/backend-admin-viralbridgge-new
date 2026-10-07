import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ALLOW_LIMITED_KEY } from './allow-limited.decorator';
import { isFullAccessUser } from './feature-access';

@Injectable()
export class FeatureAccessGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowLimited = this.reflector.getAllAndOverride<boolean>(ALLOW_LIMITED_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (allowLimited) return true;

    const user = context.switchToHttp().getRequest()?.user;
    if (isFullAccessUser(user)) return true;

    throw new ForbiddenException(
      'Campaigns, wallet, and discovery tools require a subscription or admin approval.',
    );
  }
}
