"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationsService = void 0;
const common_1 = require("@nestjs/common");
const country_state_city_1 = require("country-state-city");
const POPULAR_COUNTRY_CODES = ['IN', 'US', 'GB', 'AE', 'CA', 'AU', 'SG'];
const RESULT_LIMIT = 20;
function normalize(value) {
    return value.trim().toLowerCase();
}
function rankByQuery(items, query) {
    const q = normalize(query);
    if (!q)
        return items;
    const starts = [];
    const contains = [];
    for (const item of items) {
        const name = item.name.toLowerCase();
        if (name.startsWith(q))
            starts.push(item);
        else if (name.includes(q))
            contains.push(item);
    }
    return [...starts, ...contains];
}
let LocationsService = class LocationsService {
    searchCountries(query = '') {
        const countries = country_state_city_1.Country.getAllCountries().map((country) => ({
            name: country.name,
            isoCode: country.isoCode,
        }));
        const q = query.trim();
        if (!q) {
            const popular = POPULAR_COUNTRY_CODES.map((code) => countries.find((country) => country.isoCode === code)).filter((country) => Boolean(country));
            const rest = countries
                .filter((country) => !POPULAR_COUNTRY_CODES.includes(country.isoCode))
                .slice(0, RESULT_LIMIT - popular.length);
            return [...popular, ...rest];
        }
        return rankByQuery(countries, q).slice(0, RESULT_LIMIT);
    }
    searchStates(countryCode, query = '') {
        const code = countryCode.trim().toUpperCase();
        const states = country_state_city_1.State.getStatesOfCountry(code).map((state) => ({
            name: state.name,
            isoCode: state.isoCode,
            countryCode: state.countryCode,
        }));
        return {
            hasStates: states.length > 0,
            states: rankByQuery(states, query).slice(0, RESULT_LIMIT),
        };
    }
    searchCities(countryCode, stateCode, query = '') {
        const country = countryCode.trim().toUpperCase();
        const state = stateCode?.trim().toUpperCase();
        if (!state && country_state_city_1.State.getStatesOfCountry(country).length > 0)
            return [];
        const cities = state
            ? country_state_city_1.City.getCitiesOfState(country, state)
            : country_state_city_1.City.getCitiesOfCountry(country) ?? [];
        const options = cities.map((city) => ({
            name: city.name,
            isoCode: city.name,
            countryCode: city.countryCode,
        }));
        const unique = new Map();
        for (const option of options) {
            const key = option.name.toLowerCase();
            if (!unique.has(key))
                unique.set(key, option);
        }
        return rankByQuery([...unique.values()], query).slice(0, RESULT_LIMIT);
    }
    resolve(countryName, stateName) {
        const country = countryName?.trim()
            ? country_state_city_1.Country.getAllCountries().find((item) => item.name.toLowerCase() === countryName.trim().toLowerCase())
            : undefined;
        const state = country && stateName?.trim()
            ? country_state_city_1.State.getStatesOfCountry(country.isoCode).find((item) => item.name.toLowerCase() === stateName.trim().toLowerCase())
            : undefined;
        const states = country ? country_state_city_1.State.getStatesOfCountry(country.isoCode) : [];
        return {
            country: country ? { name: country.name, isoCode: country.isoCode } : null,
            state: state ? { name: state.name, isoCode: state.isoCode, countryCode: state.countryCode } : null,
            hasStates: states.length > 0,
        };
    }
};
exports.LocationsService = LocationsService;
exports.LocationsService = LocationsService = __decorate([
    (0, common_1.Injectable)()
], LocationsService);
//# sourceMappingURL=locations.service.js.map