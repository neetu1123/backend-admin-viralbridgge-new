export declare const DEFAULT_FROM_EMAIL = "James <James@getstrsites.com>";
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
