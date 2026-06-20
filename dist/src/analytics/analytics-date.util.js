"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveDateRange = resolveDateRange;
exports.monthKey = monthKey;
exports.formatMonthLabel = formatMonthLabel;
exports.growthPercent = growthPercent;
const common_1 = require("@nestjs/common");
function resolveDateRange(query) {
    const now = new Date();
    const to = query.to ? new Date(query.to) : now;
    if (Number.isNaN(to.getTime())) {
        throw new common_1.BadRequestException('Invalid "to" date');
    }
    if (query.from) {
        const from = new Date(query.from);
        if (Number.isNaN(from.getTime())) {
            throw new common_1.BadRequestException('Invalid "from" date');
        }
        if (from > to) {
            throw new common_1.BadRequestException('"from" must be before "to"');
        }
        const durationMs = to.getTime() - from.getTime();
        const previousTo = new Date(from.getTime() - 1);
        const previousFrom = new Date(previousTo.getTime() - durationMs);
        return { from, to, period: 'custom', previousFrom, previousTo };
    }
    const period = (query.period ?? '30d');
    const daysMap = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '1y': 365,
    };
    if (!daysMap[period]) {
        throw new common_1.BadRequestException('period must be one of: 7d, 30d, 90d, 1y');
    }
    const from = new Date(to);
    from.setDate(from.getDate() - daysMap[period]);
    const previousTo = new Date(from.getTime() - 1);
    const previousFrom = new Date(previousTo);
    previousFrom.setDate(previousFrom.getDate() - daysMap[period]);
    return { from, to, period, previousFrom, previousTo };
}
function monthKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
function formatMonthLabel(key) {
    const [year, month] = key.split('-');
    const d = new Date(Number(year), Number(month) - 1, 1);
    return d.toLocaleString('en-US', { month: 'short' });
}
function growthPercent(current, previous) {
    if (previous === 0)
        return current > 0 ? 100 : 0;
    return Number((((current - previous) / previous) * 100).toFixed(1));
}
//# sourceMappingURL=analytics-date.util.js.map