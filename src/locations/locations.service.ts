import { Injectable } from '@nestjs/common';
import { City, Country, State } from 'country-state-city';

export type LocationOption = {
  name: string;
  isoCode: string;
  countryCode?: string;
};

const POPULAR_COUNTRY_CODES = ['IN', 'US', 'GB', 'AE', 'CA', 'AU', 'SG'];
const RESULT_LIMIT = 20;

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function rankByQuery<T extends { name: string }>(items: T[], query: string) {
  const q = normalize(query);
  if (!q) return items;
  const starts: T[] = [];
  const contains: T[] = [];
  for (const item of items) {
    const name = item.name.toLowerCase();
    if (name.startsWith(q)) starts.push(item);
    else if (name.includes(q)) contains.push(item);
  }
  return [...starts, ...contains];
}

@Injectable()
export class LocationsService {
  searchCountries(query = ''): LocationOption[] {
    const countries = Country.getAllCountries().map((country) => ({
      name: country.name,
      isoCode: country.isoCode,
    }));
    const q = query.trim();
    if (!q) {
      const popular = POPULAR_COUNTRY_CODES.map((code) => countries.find((country) => country.isoCode === code)).filter(
        (country): country is LocationOption => Boolean(country),
      );
      const rest = countries
        .filter((country) => !POPULAR_COUNTRY_CODES.includes(country.isoCode))
        .slice(0, RESULT_LIMIT - popular.length);
      return [...popular, ...rest];
    }
    return rankByQuery(countries, q).slice(0, RESULT_LIMIT);
  }

  searchStates(countryCode: string, query = ''): { hasStates: boolean; states: LocationOption[] } {
    const code = countryCode.trim().toUpperCase();
    const states = State.getStatesOfCountry(code).map((state) => ({
      name: state.name,
      isoCode: state.isoCode,
      countryCode: state.countryCode,
    }));
    return {
      hasStates: states.length > 0,
      states: rankByQuery(states, query).slice(0, RESULT_LIMIT),
    };
  }

  searchCities(countryCode: string, stateCode: string | undefined, query = ''): LocationOption[] {
    const country = countryCode.trim().toUpperCase();
    const state = stateCode?.trim().toUpperCase();
    if (!state && State.getStatesOfCountry(country).length > 0) return [];
    const cities = state
      ? City.getCitiesOfState(country, state)
      : City.getCitiesOfCountry(country) ?? [];
    const options = cities.map((city) => ({
      name: city.name,
      isoCode: city.name,
      countryCode: city.countryCode,
    }));
    const unique = new Map<string, LocationOption>();
    for (const option of options) {
      const key = option.name.toLowerCase();
      if (!unique.has(key)) unique.set(key, option);
    }
    return rankByQuery([...unique.values()], query).slice(0, RESULT_LIMIT);
  }

  resolve(countryName?: string, stateName?: string) {
    const country = countryName?.trim()
      ? Country.getAllCountries().find((item) => item.name.toLowerCase() === countryName.trim().toLowerCase())
      : undefined;
    const state = country && stateName?.trim()
      ? State.getStatesOfCountry(country.isoCode).find((item) => item.name.toLowerCase() === stateName.trim().toLowerCase())
      : undefined;
    const states = country ? State.getStatesOfCountry(country.isoCode) : [];
    return {
      country: country ? { name: country.name, isoCode: country.isoCode } : null,
      state: state ? { name: state.name, isoCode: state.isoCode, countryCode: state.countryCode } : null,
      hasStates: states.length > 0,
    };
  }
}
