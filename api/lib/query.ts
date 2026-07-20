/** Express query values are strings — coerce numbers for Prisma pagination */
export function parseListQuery(query: Record<string, unknown> = {}): Record<string, unknown> {
  const page = Math.max(1, parseInt(String(query.page ?? '1'), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit ?? '20'), 10) || 20));

  const parsed: Record<string, unknown> = { ...query, page, limit };

  for (const key of ['budgetMin', 'budgetMax', 'followersMin', 'followersMax', 'engagementMin', 'deadlineDays']) {
    if (query[key] !== undefined && query[key] !== '') {
      const num = Number(query[key]);
      if (!Number.isNaN(num)) parsed[key] = num;
    }
  }

  return parsed;
}
