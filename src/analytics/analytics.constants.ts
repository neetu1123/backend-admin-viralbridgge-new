export const ANALYTICS_PERIODS = ['7d', '30d', '90d', '1y'] as const;
export type AnalyticsPeriod = (typeof ANALYTICS_PERIODS)[number];

export const ANALYTICS_CACHE_TTL_SECONDS = 120;

export const PLATFORM_COLORS: Record<string, string> = {
  Instagram: '#8b5cf6',
  YouTube: '#3b82f6',
  TikTok: '#ec4899',
  Facebook: '#2563eb',
  LinkedIn: '#0a66c2',
};

export const CATEGORY_COLORS = ['#8b5cf6', '#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#6366f1', '#14b8a6'];
