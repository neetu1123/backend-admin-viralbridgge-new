"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrmController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../auth/auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const crm_dto_1 = require("./crm.dto");
const crm_service_1 = require("./crm.service");
const crm_enhancement_service_1 = require("./crm-enhancement.service");
let CrmController = class CrmController {
    crm;
    crmEnhancement;
    constructor(crm, crmEnhancement) {
        this.crm = crm;
        this.crmEnhancement = crmEnhancement;
    }
    getSummary() {
        return this.crm.getSummary();
    }
    getAssignees() {
        return this.crm.getAssignees();
    }
    getLeads(query) {
        return this.crm.getLeads(query);
    }
    getLead(id) {
        return this.crm.getLead(id);
    }
    createLead(body, req) {
        return this.crm.createLead(body, req.user?.id, req.user?.name);
    }
    updateLead(id, body, req) {
        return this.crm.updateLead(id, body, req.user?.name);
    }
    deleteLead(id) {
        return this.crm.deleteLead(id);
    }
    archiveLead(id, req) {
        return this.crm.archiveLead(id, req.user?.name);
    }
    addNote(id, body, req) {
        return this.crm.addNote(id, body.content, req.user?.name || 'Admin');
    }
    updateNote(leadId, noteId, body) {
        return this.crm.updateNote(leadId, noteId, body.content);
    }
    deleteNote(leadId, noteId) {
        return this.crm.deleteNote(leadId, noteId);
    }
    addFollowUp(id, body) {
        return this.crm.addFollowUp(id, body);
    }
    completeFollowUp(leadId, followUpId) {
        return this.crm.completeFollowUp(leadId, followUpId);
    }
    getAgents(activeOnly) {
        return this.crmEnhancement.getAgents(activeOnly === 'true');
    }
    getAgentWorkload(userId) {
        return this.crmEnhancement.getAgentWorkload(userId);
    }
    bulkAssign(body, req) {
        return this.crmEnhancement.bulkAssign(body.leadIds, body.agentId, req.user.id);
    }
    bulkAutoAssign(body, req) {
        return this.crmEnhancement.bulkAutoAssign(body.leadIds, req.user.id);
    }
    bulkUpdate(body) {
        return this.crmEnhancement.bulkUpdate(body.leadIds, {
            leadStatus: body.leadStatus,
            priority: body.priority,
            tags: body.tags,
        });
    }
    bulkDelete(body) {
        return this.crmEnhancement.bulkDelete(body.leadIds);
    }
    assignLead(leadId, body, req) {
        return this.crmEnhancement.assignLead(leadId, body.agentId, req.user.id);
    }
    reassignLead(leadId, body, req) {
        return this.crmEnhancement.reassignLead(leadId, body.agentId, req.user.id, body.reason);
    }
    getAssignmentHistory(leadId) {
        return this.crmEnhancement.getAssignmentHistory(leadId);
    }
    importPreview(body, req) {
        return this.crmEnhancement.importPreview(body.fileName, body.rows, req.user.id);
    }
    importConfirm(body, req) {
        return this.crmEnhancement.importConfirm(body.importJobId, req.user.id, body.duplicateStrategy ?? 'SKIP');
    }
    getImportHistory() {
        return this.crmEnhancement.getImportHistory();
    }
    getImportJob(importId) {
        return this.crmEnhancement.getImportJob(importId);
    }
    getImportErrors(importId) {
        return this.crmEnhancement.getImportErrorsCsv(importId);
    }
    exportLeads(body, req) {
        return this.crmEnhancement.exportLeads(req.user.id, body);
    }
    getExportHistory() {
        return this.crmEnhancement.getExportHistory();
    }
    getExportDownload(exportId) {
        return this.crmEnhancement.getExportDownload(exportId);
    }
    getLeadIdsByFilters(body) {
        return this.crmEnhancement.getLeadIdsByFilters(body);
    }
};
exports.CrmController = CrmController;
__decorate([
    (0, common_1.Get)('summary'),
    (0, swagger_1.ApiOperation)({ summary: 'CRM dashboard summary stats' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('assignees'),
    (0, swagger_1.ApiOperation)({ summary: 'List admin users for lead assignment' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "getAssignees", null);
__decorate([
    (0, common_1.Get)('leads'),
    (0, swagger_1.ApiOperation)({ summary: 'List CRM leads with filters' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [crm_dto_1.CrmLeadQueryDto]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "getLeads", null);
__decorate([
    (0, common_1.Get)('leads/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single CRM lead' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "getLead", null);
__decorate([
    (0, common_1.Post)('leads'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new CRM lead' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [crm_dto_1.CreateCrmLeadDto, Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "createLead", null);
__decorate([
    (0, common_1.Patch)('leads/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a CRM lead' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, crm_dto_1.UpdateCrmLeadDto, Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "updateLead", null);
__decorate([
    (0, common_1.Delete)('leads/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Soft-delete a CRM lead' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "deleteLead", null);
__decorate([
    (0, common_1.Patch)('leads/:id/archive'),
    (0, swagger_1.ApiOperation)({ summary: 'Archive a CRM lead' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "archiveLead", null);
__decorate([
    (0, common_1.Post)('leads/:id/notes'),
    (0, swagger_1.ApiOperation)({ summary: 'Add a note to a lead' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, crm_dto_1.CreateCrmNoteDto, Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "addNote", null);
__decorate([
    (0, common_1.Patch)('leads/:leadId/notes/:noteId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a lead note' }),
    __param(0, (0, common_1.Param)('leadId')),
    __param(1, (0, common_1.Param)('noteId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, crm_dto_1.UpdateCrmNoteDto]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "updateNote", null);
__decorate([
    (0, common_1.Delete)('leads/:leadId/notes/:noteId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a lead note' }),
    __param(0, (0, common_1.Param)('leadId')),
    __param(1, (0, common_1.Param)('noteId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "deleteNote", null);
__decorate([
    (0, common_1.Post)('leads/:id/follow-ups'),
    (0, swagger_1.ApiOperation)({ summary: 'Schedule a follow-up' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, crm_dto_1.CreateCrmFollowUpDto]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "addFollowUp", null);
__decorate([
    (0, common_1.Patch)('leads/:leadId/follow-ups/:followUpId/complete'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark follow-up as completed' }),
    __param(0, (0, common_1.Param)('leadId')),
    __param(1, (0, common_1.Param)('followUpId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "completeFollowUp", null);
__decorate([
    (0, common_1.Get)('agents'),
    __param(0, (0, common_1.Query)('activeOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "getAgents", null);
__decorate([
    (0, common_1.Get)('agents/:userId/workload'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "getAgentWorkload", null);
__decorate([
    (0, common_1.Post)('leads/bulk-assign'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [crm_dto_1.BulkAssignDto, Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "bulkAssign", null);
__decorate([
    (0, common_1.Post)('leads/bulk-auto-assign'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [crm_dto_1.BulkLeadIdsDto, Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "bulkAutoAssign", null);
__decorate([
    (0, common_1.Post)('leads/bulk-update'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [crm_dto_1.BulkUpdateDto]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "bulkUpdate", null);
__decorate([
    (0, common_1.Post)('leads/bulk-delete'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [crm_dto_1.BulkLeadIdsDto]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "bulkDelete", null);
__decorate([
    (0, common_1.Post)('leads/:leadId/assign'),
    __param(0, (0, common_1.Param)('leadId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "assignLead", null);
__decorate([
    (0, common_1.Post)('leads/:leadId/reassign'),
    __param(0, (0, common_1.Param)('leadId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, crm_dto_1.ReassignLeadDto, Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "reassignLead", null);
__decorate([
    (0, common_1.Get)('leads/:leadId/assignment-history'),
    __param(0, (0, common_1.Param)('leadId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "getAssignmentHistory", null);
__decorate([
    (0, common_1.Post)('leads/import/preview'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [crm_dto_1.ImportPreviewDto, Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "importPreview", null);
__decorate([
    (0, common_1.Post)('leads/import/confirm'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [crm_dto_1.ImportConfirmDto, Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "importConfirm", null);
__decorate([
    (0, common_1.Get)('import-history'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "getImportHistory", null);
__decorate([
    (0, common_1.Get)('import/:importId'),
    __param(0, (0, common_1.Param)('importId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "getImportJob", null);
__decorate([
    (0, common_1.Get)('import/:importId/errors'),
    __param(0, (0, common_1.Param)('importId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "getImportErrors", null);
__decorate([
    (0, common_1.Post)('leads/export'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [crm_dto_1.ExportLeadsDto, Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "exportLeads", null);
__decorate([
    (0, common_1.Get)('export-history'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "getExportHistory", null);
__decorate([
    (0, common_1.Get)('export/:exportId/download'),
    __param(0, (0, common_1.Param)('exportId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "getExportDownload", null);
__decorate([
    (0, common_1.Post)('leads/filter-ids'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [crm_dto_1.CrmLeadQueryDto]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "getLeadIdsByFilters", null);
exports.CrmController = CrmController = __decorate([
    (0, swagger_1.ApiTags)('CRM'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'ADMIN'),
    (0, common_1.Controller)('admin/crm'),
    __metadata("design:paramtypes", [crm_service_1.CrmService,
        crm_enhancement_service_1.CrmEnhancementService])
], CrmController);
//# sourceMappingURL=crm.controller.js.map