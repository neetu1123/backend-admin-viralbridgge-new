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
var EscrowAutoReleaseProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EscrowAutoReleaseProcessor = exports.ESCROW_AUTO_RELEASE_QUEUE = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const deliverables_service_1 = require("../payments/deliverables.service");
exports.ESCROW_AUTO_RELEASE_QUEUE = 'escrow-auto-release';
let EscrowAutoReleaseProcessor = EscrowAutoReleaseProcessor_1 = class EscrowAutoReleaseProcessor extends bullmq_1.WorkerHost {
    deliverablesService;
    logger = new common_1.Logger(EscrowAutoReleaseProcessor_1.name);
    constructor(deliverablesService) {
        super();
        this.deliverablesService = deliverablesService;
    }
    async process(job) {
        if (job.name !== 'run-auto-release')
            return;
        const result = await this.deliverablesService.processAutoReleases();
        if (result.processed > 0) {
            this.logger.log(`Auto-released ${result.processed} escrow(s) via BullMQ`);
        }
        return result;
    }
};
exports.EscrowAutoReleaseProcessor = EscrowAutoReleaseProcessor;
exports.EscrowAutoReleaseProcessor = EscrowAutoReleaseProcessor = EscrowAutoReleaseProcessor_1 = __decorate([
    (0, bullmq_1.Processor)(exports.ESCROW_AUTO_RELEASE_QUEUE),
    __metadata("design:paramtypes", [deliverables_service_1.DeliverablesService])
], EscrowAutoReleaseProcessor);
//# sourceMappingURL=escrow-auto-release.processor.js.map