import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MatchingService } from '../matching/matching.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private matchingService: MatchingService,
  ) {}

  // ─── Audit Log Helpers ───────────────────────────────────────────────────────

  async createAuditLog(params: {
    admin_id: string;
    action: string;
    entity: string;
    entity_id: string;
    metadata?: any;
  }) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          admin_id: params.admin_id,
          action: params.action,
          entity: params.entity,
          entity_id: params.entity_id,
          metadata: params.metadata ?? {},
        },
      });
    } catch (e) {
      // Non-critical — never break main flow
      console.error('AuditLog write failed:', e);
    }
  }

  async getAuditLogs(query: {
    page?: number;
    limit?: number;
    entity?: string;
    action?: string;
    admin_id?: string;
  }) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, query.limit ?? 50);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (query.entity) where['entity'] = query.entity;
    if (query.admin_id) where['admin_id'] = query.admin_id;
    if (query.action) {
      where['action'] = { contains: query.action, mode: 'insensitive' };
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          admin: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAuditLogStats() {
    const total = await this.prisma.auditLog.count();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await this.prisma.auditLog.count({
      where: { created_at: { gte: today } },
    });
    const entityGroups = await this.prisma.auditLog.groupBy({
      by: ['entity'],
      _count: { entity: true },
      orderBy: { _count: { entity: 'desc' } },
    });
    return { total, today: todayCount, byEntity: entityGroups };
  }

  // ─── Roles & Admins ──────────────────────────────────────────────────────────

  async getRoles() {
    return this.prisma.role.findMany({
      include: {
        _count: {
          select: { users: true }
        }
      }
    });
  }

  async createRole(name: string, description: string, adminId?: string) {
    const role = await this.prisma.role.create({
      data: { name, description }
    });
    if (adminId) {
      await this.createAuditLog({
        admin_id: adminId, action: 'CREATE_ROLE', entity: 'Role', entity_id: role.id, metadata: { name }
      });
    }
    return role;
  }

  async updateRole(id: string, name: string, description: string, adminId?: string) {
    const existing = await this.prisma.role.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Role not found');
    }

    // Prevent renaming system-critical roles
    if (['SUPER_ADMIN', 'ADMIN'].includes(existing.name) && existing.name !== name) {
      throw new (require('@nestjs/common').BadRequestException)('System critical roles (SUPER_ADMIN, ADMIN) cannot be renamed.');
    }

    const role = await this.prisma.role.update({
      where: { id },
      data: { name, description }
    });
    if (adminId) {
      await this.createAuditLog({
        admin_id: adminId, action: 'UPDATE_ROLE', entity: 'Role', entity_id: id, metadata: { name }
      });
    }
    return role;
  }

  async deleteRole(id: string, adminId?: string) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Prevent deletion of system-critical roles
    if (['SUPER_ADMIN', 'ADMIN'].includes(role.name)) {
      throw new (require('@nestjs/common').BadRequestException)('System critical roles (SUPER_ADMIN, ADMIN) cannot be deleted.');
    }

    // Disassociate all users having this role
    await this.prisma.user.updateMany({
      where: { role_id: id },
      data: { role_id: null }
    });

    await this.prisma.role.delete({ where: { id } });
    if (adminId) {
      await this.createAuditLog({
        admin_id: adminId, action: 'DELETE_ROLE', entity: 'Role', entity_id: id, metadata: { name: role.name }
      });
    }
    return role;
  }

  async getAdmins() {
    return this.prisma.user.findMany({
      where: { role_id: { not: null } },
      include: { role: true },
    });
  }

  async assignRoleByEmail(params: { email: string; role_id: string; password?: string; name?: string }, adminId?: string) {
    const { email, role_id, password, name } = params;
    let user = await this.prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      if (!password) {
        throw new (require('@nestjs/common').BadRequestException)('User not found. Provide a password to create a new account.');
      }
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash(password, 10);
      
      user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || email.split('@')[0],
          role_id,
          is_verified: true,
          status: 'ACTIVE'
        }
      });
      
      if (adminId) {
        await this.createAuditLog({
          admin_id: adminId, action: 'CREATE_ADMIN_USER', entity: 'User', entity_id: user.id, metadata: { email, role_id }
        });
      }
    } else {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { role_id }
      });
      
      if (adminId) {
        await this.createAuditLog({
          admin_id: adminId, action: 'ASSIGN_ADMIN_ROLE', entity: 'User', entity_id: user.id, metadata: { role_id, email }
        });
      }
    }
    return user;
  }

  // ─── Users ───────────────────────────────────────────────────────────────────

  async getUsers() {
    return this.prisma.user.findMany({
      where: {
        is_deleted: false,
        role: { name: { in: ['CREATOR', 'BRAND'] } },
      },
      include: {
        role: true,
        creator_profile: {
          include: { _count: { select: { applications: true } } },
        },
        brand_profile: {
          include: { _count: { select: { campaigns: true } } },
        },
        wallets: { select: { available_balance: true, pending_balance: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true, creator_profile: true, brand_profile: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUserRole(id: string, role_id: string, adminId?: string) {
    const result = await this.prisma.user.update({
      where: { id },
      data: { role_id },
    });
    if (adminId) {
      await this.createAuditLog({
        admin_id: adminId,
        action: 'UPDATE_USER_ROLE',
        entity: 'User',
        entity_id: id,
        metadata: { role_id },
      });
    }
    return result;
  }

  async banUser(id: string, adminId?: string) {
    const result = await this.prisma.user.update({
      where: { id },
      data: { is_banned: true },
    });
    if (adminId) {
      await this.createAuditLog({
        admin_id: adminId,
        action: 'BAN_USER',
        entity: 'User',
        entity_id: id,
        metadata: { banned: true },
      });
    }
    return result;
  }

  async unbanUser(id: string, adminId?: string) {
    const result = await this.prisma.user.update({
      where: { id },
      data: { is_banned: false },
    });
    if (adminId) {
      await this.createAuditLog({
        admin_id: adminId,
        action: 'UNBAN_USER',
        entity: 'User',
        entity_id: id,
        metadata: { banned: false },
      });
    }
    return result;
  }

  // ─── Campaigns ───────────────────────────────────────────────────────────────

  async getCampaigns() {
    return this.prisma.campaign.findMany({
      include: { brand: { include: { user: true } } },
    });
  }

  async getFlaggedCampaigns() {
    return this.prisma.campaign.findMany({
      where: { status: 'FLAGGED' },
      include: { brand: true },
    });
  }

  async approveCampaign(id: string, adminId?: string) {
    const result = await this.prisma.campaign.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });
    if (adminId) {
      await this.createAuditLog({
        admin_id: adminId,
        action: 'APPROVE_CAMPAIGN',
        entity: 'Campaign',
        entity_id: id,
        metadata: { status: 'ACTIVE' },
      });
    }
    await this.matchingService.runMatchingForCampaign(id);
    return result;
  }

  // ─── Platform Settings ─────────────────────────────────────────────────────────

  async getSettings() {
    const settings = await this.matchingService.getOrCreatePlatformSettings();
    return {
      aiMatchingEnabled: settings.ai_matching_enabled,
      updatedAt: settings.updated_at,
    };
  }

  async updateSettings(body: { aiMatchingEnabled?: boolean }, adminId?: string) {
    const settings = await this.matchingService.getOrCreatePlatformSettings();
    let updated;
    try {
      updated = await this.prisma.platformSettings.update({
        where: { id: 'default' },
        data: {
          ai_matching_enabled: body.aiMatchingEnabled ?? settings.ai_matching_enabled,
          updated_by: adminId ?? null,
        },
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('does not exist') || msg.includes('platform_settings') || msg.includes('P2021')) {
        throw new (require('@nestjs/common').BadRequestException)(
          'Database not migrated. Run: npx prisma migrate deploy',
        );
      }
      throw error;
    }
    if (adminId) {
      await this.createAuditLog({
        admin_id: adminId,
        action: 'UPDATE_PLATFORM_SETTINGS',
        entity: 'platform_settings',
        entity_id: 'default',
        metadata: { aiMatchingEnabled: updated.ai_matching_enabled },
      });
    }
    return {
      aiMatchingEnabled: updated.ai_matching_enabled,
      updatedAt: updated.updated_at,
    };
  }

  // ─── AI Matching ───────────────────────────────────────────────────────────────

  getMatches() {
    return this.matchingService.getAdminMatches();
  }

  updateMatch(id: string, status: 'active' | 'removed' | 'forced', adminId?: string) {
    return this.matchingService.updateMatchStatus(id, status, adminId);
  }

  runMatching() {
    return this.matchingService.runMatchingForAllActiveCampaigns();
  }

  async rejectCampaign(id: string, adminId?: string) {
    const result = await this.prisma.campaign.update({
      where: { id },
      data: { status: 'REJECTED' },
    });
    if (adminId) {
      await this.createAuditLog({
        admin_id: adminId,
        action: 'REJECT_CAMPAIGN',
        entity: 'Campaign',
        entity_id: id,
        metadata: { status: 'REJECTED' },
      });
    }
    return result;
  }

  async flagCampaign(id: string, reason: string, adminId?: string) {
    const result = await this.prisma.campaign.update({
      where: { id },
      data: { status: 'FLAGGED' },
    });
    if (adminId) {
      await this.createAuditLog({
        admin_id: adminId,
        action: 'FLAG_CAMPAIGN',
        entity: 'Campaign',
        entity_id: id,
        metadata: { status: 'FLAGGED', reason },
      });
    }
    return result;
  }

  // ─── Transactions & Analytics ────────────────────────────────────────────────

  async getTransactions() {
    return this.prisma.transaction.findMany({
      include: { wallet: { include: { user: true } } },
    });
  }

  async getDashboardStats() {
    const users = await this.prisma.user.count();
    const campaigns = await this.prisma.campaign.count();
    const escrows = await this.prisma.escrow.aggregate({
      _sum: { amount: true }
    });
    const auditLogs = await this.prisma.auditLog.count();

    return {
      totalUsers: users,
      totalCampaigns: campaigns,
      gmv: escrows._sum.amount || 0,
      totalAuditLogs: auditLogs,
    };
  }

  async getWithdrawals(status = 'PENDING') {
    return this.prisma.transaction.findMany({
      where: { type: 'WITHDRAWAL', status: status.toUpperCase() },
      include: { wallet: { include: { user: true } } },
      orderBy: { created_at: 'desc' },
    });
  }

  async approveWithdrawal(id: string, adminId?: string) {
    const txn = await this.prisma.transaction.update({
      where: { id },
      data: { status: 'COMPLETED' },
      include: { wallet: { include: { user: true } } },
    });
    if (adminId) {
      await this.createAuditLog({
        admin_id: adminId,
        action: 'APPROVE_WITHDRAWAL',
        entity: 'Transaction',
        entity_id: id,
        metadata: { amount: txn.amount },
      });
    }
    return txn;
  }

  async rejectWithdrawal(id: string, adminId?: string, reason?: string) {
    const txn = await this.prisma.transaction.findUnique({
      where: { id },
      include: { wallet: true },
    });
    if (!txn) throw new (require('@nestjs/common').NotFoundException)('Withdrawal not found');

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.transaction.update({
        where: { id },
        data: { status: 'REJECTED' },
        include: { wallet: { include: { user: true } } },
      });
      if (txn.wallet) {
        await tx.wallet.update({
          where: { id: txn.wallet.id },
          data: { available_balance: { increment: txn.amount } },
        });
      }
      return result;
    });

    if (adminId) {
      await this.createAuditLog({
        admin_id: adminId,
        action: 'REJECT_WITHDRAWAL',
        entity: 'Transaction',
        entity_id: id,
        metadata: { amount: updated.amount, reason },
      });
    }
    return updated;
  }

  private adminCampaignsModule() {
    return require(require('path').join(__dirname, '../../api/lib/admin-campaigns')) as typeof import('../../api/lib/admin-campaigns');
  }

  private auditCampaignForBrand = async (data: {
    adminId: string;
    brandId: string;
    campaignId: string;
    metadata?: unknown;
  }) => {
    await this.createAuditLog({
      admin_id: data.adminId,
      action: 'CREATE_CAMPAIGN_FOR_BRAND',
      entity: 'Campaign',
      entity_id: data.campaignId,
      metadata: { brand_id: data.brandId, ...(data.metadata as object) },
    });
  };

  async listBrands(query: {
    search?: string;
    industry?: string;
    status?: string;
    verified?: string;
    page?: number;
    limit?: number;
  }) {
    return this.adminCampaignsModule().listAdminBrands(this.prisma, query);
  }

  async getBrandDetail(id: string) {
    const result = await this.adminCampaignsModule().getAdminBrandDetail(this.prisma, id);
    if (!result) throw new NotFoundException('Brand not found');
    return result;
  }

  async createCampaignForBrand(adminId: string, body: Record<string, unknown>) {
    return this.adminCampaignsModule().createCampaignForBrand(
      this.prisma,
      adminId,
      body,
      this.auditCampaignForBrand,
    );
  }

  async createCampaignWithBrand(adminId: string, body: Record<string, unknown>) {
    return this.adminCampaignsModule().createCampaignWithBrand(
      this.prisma,
      adminId,
      body,
      this.auditCampaignForBrand,
    );
  }
}
