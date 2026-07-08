"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildBroadcastHtml = buildBroadcastHtml;
const base_template_1 = require("./base.template");
function buildBroadcastHtml(params) {
    const paragraphs = params.message
        .split(/\n+/)
        .map((line) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#334155;">${(0, base_template_1.escapeHtml)(line.trim())}</p>`)
        .join('');
    const cta = params.ctaLabel && params.ctaUrl
        ? (0, base_template_1.primaryButton)(params.ctaLabel, params.ctaUrl)
        : '';
    return (0, base_template_1.wrapEmailHtml)(params.title, `<h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0f172a;">${(0, base_template_1.escapeHtml)(params.title)}</h1>${paragraphs}${cta}`);
}
//# sourceMappingURL=broadcast.template.js.map