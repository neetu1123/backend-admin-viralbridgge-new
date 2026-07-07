import { escapeHtml, primaryButton, wrapEmailHtml } from './base.template';

export function buildBroadcastHtml(params: {
  title: string;
  message: string;
  ctaLabel?: string;
  ctaUrl?: string;
}): string {
  const paragraphs = params.message
    .split(/\n+/)
    .map((line) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#334155;">${escapeHtml(line.trim())}</p>`)
    .join('');

  const cta =
    params.ctaLabel && params.ctaUrl
      ? primaryButton(params.ctaLabel, params.ctaUrl)
      : '';

  return wrapEmailHtml(
    params.title,
    `<h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0f172a;">${escapeHtml(params.title)}</h1>${paragraphs}${cta}`,
  );
}
