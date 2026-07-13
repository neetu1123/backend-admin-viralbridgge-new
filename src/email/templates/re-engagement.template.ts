import { primaryButton, wrapEmailHtml } from './base.template';

export function buildCreatorReEngagementHtml(params: { name: string; appUrl: string }): string {
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0f172a;">We Miss You! New Campaigns Are Waiting 🎉</h1>
    <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.6;">Hi ${params.name},</p>
    <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.6;">Brands are actively posting new campaigns — and creators like you are getting matched every day.</p>
    <ul style="margin:0 0 16px;padding-left:20px;font-size:15px;color:#475569;line-height:1.8;">
      <li>New campaigns available in your niche</li>
      <li>Complete your profile to stand out</li>
      <li>Apply and start earning today</li>
    </ul>
    ${primaryButton('Explore Campaigns', `${params.appUrl}/campaign-discovery`)}`;
  return wrapEmailHtml('We Miss You! New Campaigns Are Waiting', body);
}

export function buildBrandReEngagementHtml(params: { name: string; appUrl: string }): string {
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0f172a;">Ready to Launch Your Next Campaign?</h1>
    <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.6;">Hi ${params.name},</p>
    <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.6;">Verified creators are ready to collaborate. Launch your next influencer campaign and grow your brand.</p>
    <ul style="margin:0 0 16px;padding-left:20px;font-size:15px;color:#475569;line-height:1.8;">
      <li>Find verified creators in your industry</li>
      <li>Create your next campaign in minutes</li>
      <li>Grow your brand with authentic content</li>
    </ul>
    ${primaryButton('Create Campaign', `${params.appUrl}/brand-campaign-management?create=1`)}`;
  return wrapEmailHtml('Ready to Launch Your Next Campaign?', body);
}
