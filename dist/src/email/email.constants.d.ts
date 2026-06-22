export declare const RESEND_API_URL = "https://api.resend.com/emails";
export declare const DEFAULT_FROM_EMAIL = "ViralBridge <invites@viralbridge.com>";
export declare const DEFAULT_APP_URL = "https://admin-viralbridgge-new.vercel.app";
export interface TeamInvitationEmailParams {
    to: string;
    organizationName: string;
    inviterName: string;
    roleLabel: string;
    expiresAt: Date;
    acceptUrl: string;
}
export interface InvitationAcceptedEmailParams {
    to: string;
    memberName: string;
    memberEmail: string;
    organizationName: string;
    roleLabel: string;
}
export interface MemberRemovedEmailParams {
    to: string;
    organizationName: string;
    removedByName: string;
}
