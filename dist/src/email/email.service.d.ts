import { ConfigService } from '@nestjs/config';
import { type InvitationAcceptedEmailParams, type MemberRemovedEmailParams, type TeamInvitationEmailParams } from './email.constants';
export declare class EmailService {
    private readonly config;
    private readonly logger;
    private readonly resend;
    private readonly fromEmail;
    private readonly appUrl;
    constructor(config: ConfigService);
    buildInvitationAcceptUrl(token: string): string;
    isConfigured(): boolean;
    sendTestEmail(to?: string): Promise<void>;
    sendTeamInvitation(params: TeamInvitationEmailParams): Promise<void>;
    sendReInvitation(params: TeamInvitationEmailParams): Promise<void>;
    sendInvitationAccepted(params: InvitationAcceptedEmailParams): Promise<void>;
    sendMemberRemoved(params: MemberRemovedEmailParams): Promise<void>;
    private send;
}
