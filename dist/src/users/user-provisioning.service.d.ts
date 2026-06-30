import { PrismaService } from '../prisma/prisma.service';
export declare class UserProvisioningService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    provisionUserResources(userId: string, roleName: string, displayName: string): Promise<void>;
}
