import { BadRequestException } from '@nestjs/common';
import type { AnalyticsPeriod } from './analytics.constants';

export type DateRange = {
  from: Date;
  to: Date;
  period: AnalyticsPeriod | 'custom';
  previousFrom: Date;
  previousTo: Date;
};

export function resolveDateRange(query: {
  period?: string;
  from?: string;
  to?: string;
}): DateRange {
  const now = new Date();
  const to = query.to ? new Date(query.to) : now;
  if (Number.isNaN(to.getTime())) {
    throw new BadRequestException('Invalid "to" date');
  }

  if (query.from) {
    const from = new Date(query.from);
    if (Number.isNaN(from.getTime())) {
      throw new BadRequestException('Invalid "from" date');
    }
    if (from > to) {
      throw new BadRequestException('"from" must be before "to"');
    }
    const durationMs = to.getTime() - from.getTime();
    const previousTo = new Date(from.getTime() - 1);
    const previousFrom = new Date(previousTo.getTime() - durationMs);
    return { from, to, period: 'custom', previousFrom, previousTo };
  }

  const period = (query.period ?? '30d') as AnalyticsPeriod;
  const daysMap: Record<AnalyticsPeriod, number> = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '1y': 365,
  };
  if (!daysMap[period]) {
    throw new BadRequestException('period must be one of: 7d, 30d, 90d, 1y');
  }

  const from = new Date(to);
  from.setDate(from.getDate() - daysMap[period]);
  const previousTo = new Date(from.getTime() - 1);
  const previousFrom = new Date(previousTo);
  previousFrom.setDate(previousFrom.getDate() - daysMap[period]);

  return { from, to, period, previousFrom, previousTo };
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function formatMonthLabel(key: string): string {
  const [year, month] = key.split('-');
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleString('en-US', { month: 'short' });
}

export function growthPercent(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}
