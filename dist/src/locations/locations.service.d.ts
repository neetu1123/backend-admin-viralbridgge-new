export type LocationOption = {
    name: string;
    isoCode: string;
    countryCode?: string;
};
export declare class LocationsService {
    searchCountries(query?: string): LocationOption[];
    searchStates(countryCode: string, query?: string): {
        hasStates: boolean;
        states: LocationOption[];
    };
    searchCities(countryCode: string, stateCode: string | undefined, query?: string): LocationOption[];
    resolve(countryName?: string, stateName?: string): {
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
