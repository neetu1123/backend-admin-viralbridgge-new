"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXPORT_FIELD_MAP = void 0;
exports.normalizeHeader = normalizeHeader;
exports.normalizeImportRow = normalizeImportRow;
exports.validateImportRow = validateImportRow;
exports.leadsToCsv = leadsToCsv;
const LEAD_TYPES = ['Brand', 'Creator', 'Agency', 'Enterprise Client', 'Investor', 'Partner', 'Other'];
const LEAD_SOURCES = ['Website', 'Referral', 'Social Media', 'Email Campaign', 'Cold Call', 'Manual Entry', 'Advertisement'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost', 'Inactive'];
const HEADER_MAP = {
    'first name': 'firstName',
    first_name: 'firstName',
    firstname: 'firstName',
    'last name': 'lastName',
    last_name: 'lastName',
    lastname: 'lastName',
    email: 'email',
    phone: 'phone',
    'alternate phone': 'alternatePhone',
    'whatsapp number': 'whatsapp',
    whatsapp: 'whatsapp',
    'company name': 'company',
    company: 'company',
    'job title': 'jobTitle',
    industry: 'industry',
    'company size': 'companySize',
    'gst number': 'gstNumber',
    'lead type': 'leadType',
    'lead source': 'leadSource',
    priority: 'priority',
    status: 'leadStatus',
    country: 'country',
    state: 'state',
    city: 'city',
    'postal code': 'postalCode',
    address: 'address',
    'expected deal value': 'dealValue',
    'assigned agent email': 'assignedAgentEmail',
    'next follow-up date': 'nextFollowUpDate',
    description: 'description',
    tags: 'tags',
};
function normalizeHeader(h) {
    const key = h.trim().toLowerCase();
    return HEADER_MAP[key] ?? h.trim();
}
function normalizeImportRow(raw) {
    const out = {};
    for (const [k, v] of Object.entries(raw)) {
        out[normalizeHeader(k)] = String(v ?? '').trim();
    }
    return out;
}
function validateImportRow(row, rowNumber) {
    const errors = [];
    const warnings = [];
    const firstName = row.firstName || '';
    const email = row.email || '';
    const phone = row.phone || '';
    if (!firstName)
        errors.push('First Name is required');
    if (!email && !phone)
        errors.push('Email or Phone is required');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        errors.push('Invalid email format');
    if (row.leadType && !LEAD_TYPES.includes(row.leadType)) {
        errors.push(`Invalid Lead Type: ${row.leadType}`);
    }
    if (row.leadSource && !LEAD_SOURCES.includes(row.leadSource)) {
        errors.push(`Invalid Lead Source: ${row.leadSource}`);
    }
    if (row.priority && !PRIORITIES.includes(row.priority)) {
        errors.push(`Invalid Priority: ${row.priority}`);
    }
    if (row.leadStatus && !STATUSES.includes(row.leadStatus)) {
        errors.push(`Invalid Status: ${row.leadStatus}`);
    }
    if (row.dealValue && Number.isNaN(Number(row.dealValue))) {
        errors.push('Invalid deal value');
    }
    return {
        rowNumber,
        firstName,
        lastName: row.lastName || '',
        email,
        phone,
        company: row.company || 'Unknown',
        leadType: row.leadType || 'Other',
        leadSource: row.leadSource || 'Manual Entry',
        priority: row.priority || 'Medium',
        leadStatus: row.leadStatus || 'New',
        assignedAgentEmail: row.assignedAgentEmail || '',
        dealValue: row.dealValue ? Number(row.dealValue) : undefined,
        nextFollowUpDate: row.nextFollowUpDate || undefined,
        description: row.description || undefined,
        tags: row.tags ? row.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        errors,
        warnings,
        status: errors.length ? 'ERROR' : warnings.length ? 'WARNING' : 'VALID',
    };
}
function leadsToCsv(leads, fields) {
    const header = fields.join(',');
    const rows = leads.map((lead) => fields
        .map((f) => {
        const val = lead[f];
        const str = val == null ? '' : String(val);
        return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
    })
        .join(','));
    return [header, ...rows].join('\n');
}
exports.EXPORT_FIELD_MAP = {
    firstName: (l) => String(l.firstName ?? ''),
    lastName: (l) => String(l.lastName ?? ''),
    email: (l) => String(l.email ?? ''),
    phone: (l) => String(l.phone ?? ''),
    company: (l) => String(l.company ?? ''),
    leadType: (l) => String(l.leadType ?? ''),
    leadSource: (l) => String(l.leadSource ?? ''),
    leadStatus: (l) => String(l.leadStatus ?? ''),
    priority: (l) => String(l.priority ?? ''),
    assignedToName: (l) => String(l.assignedToName ?? ''),
    createdAt: (l) => String(l.createdAt ?? ''),
    updatedAt: (l) => String(l.updatedAt ?? ''),
};
//# sourceMappingURL=crm-import.util.js.map