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
var ReEngagementProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReEngagementProcessor = exports.RE_ENGAGEMENT_QUEUE = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const re_engagement_service_1 = require("../re-engagement/re-engagement.service");
exports.RE_ENGAGEMENT_QUEUE = 're-engagement';
let ReEngagementProcessor = ReEngagementProcessor_1 = class ReEngagementProcessor extends bullmq_1.WorkerHost {
    reEngagement;
    logger = new common_1.Logger(ReEngagementProcessor_1.name);
    constructor(reEngagement) {
        super();
        this.reEngagement = reEngagement;
    }
    async process(job) {
        if (job.name !== 'run-re-engagement')
            return;
        const result = await this.reEngagement.processInactiveUsers();
        this.logger.log(`Re-engagement job sent ${result.sent} email(s)`);
        return result;
    }
};
exports.ReEngagementProcessor = ReEngagementProcessor;
exports.ReEngagementProcessor = ReEngagementProcessor = ReEngagementProcessor_1 = __decorate([
    (0, bullmq_1.Processor)(exports.RE_ENGAGEMENT_QUEUE),
    __metadata("design:paramtypes", [re_engagement_service_1.ReEngagementService])
], ReEngagementProcessor);
//# sourceMappingURL=re-engagement.processor.js.map