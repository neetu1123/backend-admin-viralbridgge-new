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
exports.LocationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const locations_service_1 = require("./locations.service");
let LocationsController = class LocationsController {
    locations;
    constructor(locations) {
        this.locations = locations;
    }
    countries(q) {
        return this.locations.searchCountries(q ?? '');
    }
    states(countryCode, q) {
        if (!countryCode?.trim()) {
            throw new common_1.BadRequestException('countryCode is required');
        }
        return this.locations.searchStates(countryCode, q ?? '');
    }
    cities(countryCode, stateCode, q) {
        if (!countryCode?.trim()) {
            throw new common_1.BadRequestException('countryCode is required');
        }
        return this.locations.searchCities(countryCode, stateCode, q ?? '');
    }
    resolve(country, state) {
        return this.locations.resolve(country, state);
    }
};
exports.LocationsController = LocationsController;
__decorate([
    (0, common_1.Get)('countries'),
    (0, swagger_1.ApiOperation)({ summary: 'Search countries for profile location' }),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LocationsController.prototype, "countries", null);
__decorate([
    (0, common_1.Get)('states'),
    (0, swagger_1.ApiOperation)({ summary: 'Search states for a country' }),
    __param(0, (0, common_1.Query)('countryCode')),
    __param(1, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], LocationsController.prototype, "states", null);
__decorate([
    (0, common_1.Get)('cities'),
    (0, swagger_1.ApiOperation)({ summary: 'Search cities for a country and state' }),
    __param(0, (0, common_1.Query)('countryCode')),
    __param(1, (0, common_1.Query)('stateCode')),
    __param(2, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], LocationsController.prototype, "cities", null);
__decorate([
    (0, common_1.Get)('resolve'),
    (0, swagger_1.ApiOperation)({ summary: 'Match saved country and state names to location codes' }),
    __param(0, (0, common_1.Query)('country')),
    __param(1, (0, common_1.Query)('state')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], LocationsController.prototype, "resolve", null);
exports.LocationsController = LocationsController = __decorate([
    (0, swagger_1.ApiTags)('Locations'),
    (0, common_1.Controller)('locations'),
    __metadata("design:paramtypes", [locations_service_1.LocationsService])
], LocationsController);
//# sourceMappingURL=locations.controller.js.map