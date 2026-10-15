import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LocationsService } from './locations.service';

@ApiTags('Locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locations: LocationsService) {}

  @Get('countries')
  @ApiOperation({ summary: 'Search countries for profile location' })
  countries(@Query('q') q?: string) {
    return this.locations.searchCountries(q ?? '');
  }

  @Get('states')
  @ApiOperation({ summary: 'Search states for a country' })
  states(@Query('countryCode') countryCode?: string, @Query('q') q?: string) {
    if (!countryCode?.trim()) {
      throw new BadRequestException('countryCode is required');
    }
    return this.locations.searchStates(countryCode, q ?? '');
  }

  @Get('cities')
  @ApiOperation({ summary: 'Search cities for a country and state' })
  cities(
    @Query('countryCode') countryCode?: string,
    @Query('stateCode') stateCode?: string,
    @Query('q') q?: string,
  ) {
    if (!countryCode?.trim()) {
      throw new BadRequestException('countryCode is required');
    }
    return this.locations.searchCities(countryCode, stateCode, q ?? '');
  }

  @Get('resolve')
  @ApiOperation({ summary: 'Match saved country and state names to location codes' })
  resolve(@Query('country') country?: string, @Query('state') state?: string) {
    return this.locations.resolve(country, state);
  }
}
