import { Router } from 'express';
import { fail, ok } from './lib/http';
import type { LocationsService } from '../src/locations/locations.service';

const router = Router();

function locations(): LocationsService {
  const { LocationsService: Service } = require('../dist/src/locations/locations.service') as {
    LocationsService: new () => LocationsService;
  };
  return new Service();
}

function queryText(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

router.get('/countries', (req, res) => {
  try {
    return ok(res, locations().searchCountries(queryText(req.query.q)));
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Failed to search countries', 500);
  }
});

router.get('/states', (req, res) => {
  const countryCode = queryText(req.query.countryCode);
  if (!countryCode.trim()) return fail(res, 'countryCode is required');
  try {
    return ok(res, locations().searchStates(countryCode, queryText(req.query.q)));
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Failed to search states', 500);
  }
});

router.get('/cities', (req, res) => {
  const countryCode = queryText(req.query.countryCode);
  if (!countryCode.trim()) return fail(res, 'countryCode is required');
  try {
    return ok(res, locations().searchCities(countryCode, queryText(req.query.stateCode), queryText(req.query.q)));
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Failed to search cities', 500);
  }
});

router.get('/resolve', (req, res) => {
  try {
    return ok(res, locations().resolve(queryText(req.query.country), queryText(req.query.state)));
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : 'Failed to resolve location', 500);
  }
});

export { router as locationsRouter };
