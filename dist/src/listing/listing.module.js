"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const notifications_module_1 = require("../notifications/notifications.module");
const discovery_module_1 = require("../discovery/discovery.module");
const storage_module_1 = require("../storage/storage.module");
const listing_service_1 = require("./listing.service");
const listing_public_controller_1 = require("./listing-public.controller");
const listing_owner_controller_1 = require("./listing-owner.controller");
const admin_listing_controller_1 = require("./admin-listing.controller");
let ListingModule = class ListingModule {
};
exports.ListingModule = ListingModule;
exports.ListingModule = ListingModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, notifications_module_1.NotificationsModule, discovery_module_1.DiscoveryModule, storage_module_1.StorageModule],
        controllers: [listing_public_controller_1.ListingPublicController, listing_owner_controller_1.ListingOwnerController, admin_listing_controller_1.AdminListingController],
        providers: [listing_service_1.ListingService],
        exports: [listing_service_1.ListingService],
    })
], ListingModule);
//# sourceMappingURL=listing.module.js.map