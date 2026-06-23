import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { getFirebaseAuth, isFirebaseConfigured, initializeFirebaseAdmin } from '../firebase/firebase-admin.config';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    if (!isFirebaseConfigured()) {
      throw new UnauthorizedException('Firebase is not configured on this server');
    }

    try {
      initializeFirebaseAdmin();
      const decodedToken = await getFirebaseAuth().verifyIdToken(token);
      request['user'] = decodedToken; // basic decoded token
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
