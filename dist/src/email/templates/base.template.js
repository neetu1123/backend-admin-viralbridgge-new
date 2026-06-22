"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapEmailHtml = wrapEmailHtml;
exports.escapeHtml = escapeHtml;
exports.primaryButton = primaryButton;
exports.formatEmailDate = formatEmailDate;
function wrapEmailHtml(title, bodyHtml) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
          <tr>
            <td style="padding:28px 32px 16px;text-align:center;border-bottom:1px solid #f1f5f9;">
              <div style="display:inline-block;font-size:22px;font-weight:800;color:#7c3aed;letter-spacing:-0.5px;">ViralBridge</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #f1f5f9;text-align:center;">
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
                &copy; ${new Date().getFullYear()} ViralBridge. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
function escapeHtml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
function primaryButton(label, href) {
    return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px auto 0;">
    <tr>
      <td style="border-radius:8px;background:#7c3aed;">
        <a href="${escapeHtml(href)}" target="_blank" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
          ${escapeHtml(label)}
        </a>
      </td>
    </tr>
  </table>`;
}
function formatEmailDate(date) {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}
//# sourceMappingURL=base.template.js.map