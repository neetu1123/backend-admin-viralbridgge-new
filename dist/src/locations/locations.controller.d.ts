import { LocationsService } from './locations.service';
export declare class LocationsController {
    private readonly locations;
    constructor(locations: LocationsService);
    countries(q?: string): import("./locations.service").LocationOption[];
    states(countryCode?: string, q?: string): {
        hasStates: boolean;
        states: import("./locations.service").LocationOption[];
    };
    cities(countryCode?: string, stateCode?: string, q?: string): import("./locations.service").LocationOption[];
    resolve(country?: string, state?: string): {
        country: {
            name: string;
            isoCode: string;
        } | null;
        state: {
            name: string;
            isoCode: string;
            countryCode: string;
        } | null;
        hasStates: boolean;
    };
}
