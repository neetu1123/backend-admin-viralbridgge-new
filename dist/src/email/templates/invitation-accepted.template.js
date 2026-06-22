"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildInvitationAcceptedHtml = buildInvitationAcceptedHtml;
const base_template_1 = require("./base.template");
function buildInvitationAcceptedHtml(params) {
    const title = `${params.memberName} joined your team`;
    const body = `
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0f172a;text-align:center;">
      Invitation accepted
    </h1>
    <p style="margin:0;font-size:15px;color:#475569;line-height:1.6;text-align:center;">
      <strong>${(0, base_template_1.escapeHtml)(params.memberName)}</strong> (${(0, base_template_1.escapeHtml)(params.memberEmail)}) has accepted your invitation
      and joined <strong>${(0, base_template_1.escapeHtml)(params.organizationName)}</strong> as
      <strong>${(0, base_template_1.escapeHtml)(params.roleLabel)}</strong>.
    </p>`;
    return (0, base_template_1.wrapEmailHtml)(title, body);
}
//# sourceMappingURL=invitation-accepted.template.js.map