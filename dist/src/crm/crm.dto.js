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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportLeadsDto = exports.ImportConfirmDto = exports.ImportPreviewDto = exports.BulkLeadIdsDto = exports.BulkUpdateDto = exports.ReassignLeadDto = exports.BulkAssignDto = exports.CrmLeadQueryDto = exports.CreateCrmFollowUpDto = exports.UpdateCrmNoteDto = exports.CreateCrmNoteDto = exports.UpdateCrmLeadDto = exports.CreateCrmLeadDto = void 0;
const class_validator_1 = require("class-validator");
class CreateCrmLeadDto {
    firstName;
    lastName;
    profilePhoto;
    gender;
    dateOfBirth;
    email;
    phone;
    alternatePhone;
    whatsapp;
    website;
    company;
    jobTitle;
    industry;
    companySize;
    gstNumber;
    country;
    state;
    city;
    postalCode;
    address;
    leadType;
    leadSource;
    priority;
    leadStatus;
    assignedToId;
    dealCurrency;
    dealValue;
    nextFollowUpDate;
    nextFollowUpTime;
    description;
    internalNotes;
    tags;
}
exports.CreateCrmLeadDto = CreateCrmLeadDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCrmLeadDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCrmLeadDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCrmLeadDto.prototype, "profilePhoto", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCrmLeadDto.prototype, "gender", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCrmLeadDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCrmLeadDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCrmLeadDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCrmLeadDto.prototype, "alternatePhone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCrmLeadDto.prototype, "whatsapp", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCrmLeadDto.prototype, "website", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCrmLeadDto.prototype, "company", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCrmLeadDto.prototype, "jobTitle", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCrmLeadDto.prototype, "industry", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCrmLeadDto.prototype, "companySize", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCrmLeadDto.prototype, "gstNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCrmLeadDto.prototype, "country", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCrmLeadDto.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCrmLeadDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCrmLeadDto.prototype, "postalCode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCrmLeadDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCrmLeadDto.prototype, "leadType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCrmLeadDto.prototype, "leadSource", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCrmLeadDto.prototype, "priority", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCrmLeadDto.prototype, "leadStatus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCrmLeadDto.prototype, "assignedToId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCrmLeadDto.prototype, "dealCurrency", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCrmLeadDto.prototype, "dealValue", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCrmLeadDto.prototype, "nextFollowUpDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCrmLeadDto.prototype, "nextFollowUpTime", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCrmLeadDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCrmLeadDto.prototype, "internalNotes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateCrmLeadDto.prototype, "tags", void 0);
class UpdateCrmLeadDto extends CreateCrmLeadDto {
}
exports.UpdateCrmLeadDto = UpdateCrmLeadDto;
class CreateCrmNoteDto {
    content;
}
exports.CreateCrmNoteDto = CreateCrmNoteDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCrmNoteDto.prototype, "content", void 0);
class UpdateCrmNoteDto {
    content;
}
exports.UpdateCrmNoteDto = UpdateCrmNoteDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCrmNoteDto.prototype, "content", void 0);
class CreateCrmFollowUpDto {
    title;
    date;
    time;
    notes;
}
exports.CreateCrmFollowUpDto = CreateCrmFollowUpDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCrmFollowUpDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCrmFollowUpDto.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCrmFollowUpDto.prototype, "time", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCrmFollowUpDto.prototype, "notes", void 0);
class CrmLeadQueryDto {
    search;
    leadStatus;
    leadType;
    priority;
    assignedToId;
    source;
    dateFrom;
    dateTo;
    sort;
    page;
    limit;
}
exports.CrmLeadQueryDto = CrmLeadQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CrmLeadQueryDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CrmLeadQueryDto.prototype, "leadStatus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CrmLeadQueryDto.prototype, "leadType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CrmLeadQueryDto.prototype, "priority", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CrmLeadQueryDto.prototype, "assignedToId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CrmLeadQueryDto.prototype, "source", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CrmLeadQueryDto.prototype, "dateFrom", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CrmLeadQueryDto.prototype, "dateTo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CrmLeadQueryDto.prototype, "sort", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CrmLeadQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CrmLeadQueryDto.prototype, "limit", void 0);
class BulkAssignDto {
    leadIds;
    agentId;
}
exports.BulkAssignDto = BulkAssignDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], BulkAssignDto.prototype, "leadIds", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkAssignDto.prototype, "agentId", void 0);
class ReassignLeadDto {
    agentId;
    reason;
}
exports.ReassignLeadDto = ReassignLeadDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReassignLeadDto.prototype, "agentId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReassignLeadDto.prototype, "reason", void 0);
class BulkUpdateDto {
    leadIds;
    leadStatus;
    priority;
    tags;
}
exports.BulkUpdateDto = BulkUpdateDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], BulkUpdateDto.prototype, "leadIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkUpdateDto.prototype, "leadStatus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkUpdateDto.prototype, "priority", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], BulkUpdateDto.prototype, "tags", void 0);
class BulkLeadIdsDto {
    leadIds;
}
exports.BulkLeadIdsDto = BulkLeadIdsDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], BulkLeadIdsDto.prototype, "leadIds", void 0);
class ImportPreviewDto {
    fileName;
    rows;
}
exports.ImportPreviewDto = ImportPreviewDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImportPreviewDto.prototype, "fileName", void 0);
class ImportConfirmDto {
    importJobId;
    duplicateStrategy;
}
exports.ImportConfirmDto = ImportConfirmDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImportConfirmDto.prototype, "importJobId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImportConfirmDto.prototype, "duplicateStrategy", void 0);
class ExportLeadsDto {
    leadIds;
    filters;
    fields;
}
exports.ExportLeadsDto = ExportLeadsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], ExportLeadsDto.prototype, "leadIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", CrmLeadQueryDto)
], ExportLeadsDto.prototype, "filters", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], ExportLeadsDto.prototype, "fields", void 0);
//# sourceMappingURL=crm.dto.js.map