"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildMemberRemovedHtml = buildMemberRemovedHtml;
const base_template_1 = require("./base.template");
function buildMemberRemovedHtml(params) {
    const title = `Removed from ${params.organizationName}`;
    const body = `
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0f172a;text-align:center;">
      Team access removed
    </h1>
    <p style="margin:0;font-size:15px;color:#475569;line-height:1.6;text-align:center;">
      <strong>${(0, base_template_1.escapeHtml)(params.removedByName)}</strong> removed you from
      <strong>${(0, base_template_1.escapeHtml)(params.organizationName)}</strong> on ViralBridge.
    </p>
    <p style="margin:16px 0 0;font-size:13px;color:#94a3b8;line-height:1.6;text-align:center;">
      If you believe this was a mistake, please contact the organization owner.
    </p>`;
    return (0, base_template_1.wrapEmailHtml)(title, body);
}
//# sourceMappingURL=member-removed.template.js.map