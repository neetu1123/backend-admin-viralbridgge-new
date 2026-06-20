import type { AnalyticsPeriod } from './analytics.constants';
export type DateRange = {
    from: Date;
    to: Date;
    period: AnalyticsPeriod | 'custom';
    previousFrom: Date;
    previousTo: Date;
};
export declare function resolveDateRange(query: {
    period?: string;
    from?: string;
    to?: string;
}): DateRange;
export declare function monthKey(date: Date): string;
export declare function formatMonthLabel(key: string): string;
export declare function growthPercent(current: number, previous: number): number;
