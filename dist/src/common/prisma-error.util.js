"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPrismaMissingTableError = isPrismaMissingTableError;
exports.isPrismaMissingColumnError = isPrismaMissingColumnError;
const client_1 = require("@prisma/client");
function isPrismaMissingTableError(error) {
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        return error.code === 'P2021' || error.code === 'P2010';
    }
    const msg = error instanceof Error ? error.message : String(error);
    return (msg.includes('does not exist') ||
        msg.includes('P2021') ||
        msg.includes('user_activity') ||
        msg.includes('re_engagement_email_logs') ||
        msg.includes('campaign_prompt_events'));
}
function isPrismaMissingColumnError(error) {
    const msg = error instanceof Error ? error.message : String(error);
    return (msg.includes('column') && msg.includes('does not exist') ||
        msg.includes('reengagement_'));
}
//# sourceMappingURL=prisma-error.util.js.map