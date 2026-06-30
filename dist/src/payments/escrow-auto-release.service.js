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
var EscrowAutoReleaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EscrowAutoReleaseService = void 0;
const common_1 = require("@nestjs/common");
const deliverables_service_1 = require("./deliverables.service");
const AUTO_RELEASE_INTERVAL_MS = 60 * 60 * 1000;
let EscrowAutoReleaseService = EscrowAutoReleaseService_1 = class EscrowAutoReleaseService {
    deliverablesService;
    logger = new common_1.Logger(EscrowAutoReleaseService_1.name);
    intervalRef = null;
    constructor(deliverablesService) {
        this.deliverablesService = deliverablesService;
    }
    onModuleInit() {
        if (process.env.VERCEL || process.env.DISABLE_ESCROW_AUTO_RELEASE === 'true') {
            return;
        }
        this.intervalRef = setInterval(() => {
            void this.runAutoRelease();
        }, AUTO_RELEASE_INTERVAL_MS);
        void this.runAutoRelease();
        this.logger.log('Escrow auto-release job started (hourly). Set REDIS_URL for BullMQ in dedicated workers.');
    }
    onModuleDestroy() {
        if (this.intervalRef)
            clearInterval(this.intervalRef);
    }
    async runAutoRelease() {
        try {
            const result = await this.deliverablesService.processAutoReleases();
            if (result.processed > 0) {
                this.logger.log(`Auto-released ${result.processed} escrow(s)`);
            }
        }
        catch (err) {
            this.logger.error('Escrow auto-release failed', err);
        }
    }
};
exports.EscrowAutoReleaseService = EscrowAutoReleaseService;
exports.EscrowAutoReleaseService = EscrowAutoReleaseService = EscrowAutoReleaseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [deliverables_service_1.DeliverablesService])
], EscrowAutoReleaseService);
//# sourceMappingURL=escrow-auto-release.service.js.map