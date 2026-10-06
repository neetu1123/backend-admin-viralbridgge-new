import { Body, Controller, Get, Headers, Param, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ListingService } from './listing.service';
import { ListingEnquiryDto, ListingEventDto, ListingReportDto, ListingSearchQueryDto } from './listing.dto';

@ApiTags('Discover')
@Controller('discover')
export class ListingPublicController {
  constructor(private readonly listings: ListingService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Public discover categories' })
  categories(@Query('type') type?: string) {
    return this.listings.getCategories(type);
  }

  @Get('locations')
  @ApiOperation({ summary: 'Public discover cities' })
  locations() {
    return this.listings.getLocations();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search published free listings and existing discover profiles' })
  search(@Query() query: ListingSearchQueryDto) {
    return this.listings.searchPublic(query);
  }

  @Post('events')
  track(@Body() body: ListingEventDto) {
    return this.listings.trackEvent(body);
  }

  @Post(':id/enquiry')
  @Throttle({ default: { limit: 8, ttl: 60000 } })
  enquiry(
    @Param('id') id: string,
    @Body() body: ListingEnquiryDto,
    @Headers('authorization') authorization?: string,
    @Req() req?: { ip?: string; headers?: Record<string, string | string[] | undefined> },
  ) {
    const forwarded = req?.headers?.['x-forwarded-for'];
    const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0]?.trim() || req?.ip;
    return this.listings.createEnquiry(id, body, authorization, ip);
  }

  @Post(':id/report')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  report(@Param('id') id: string, @Body() body: ListingReportDto) {
    return this.listings.report(id, body);
  }

  @Get('business/:slug')
  business(@Param('slug') slug: string) {
    return this.listings.getPublic('BUSINESS', slug);
  }

  @Get('creator/:slug')
  creator(@Param('slug') slug: string) {
    return this.listings.getPublic('CREATOR', slug);
  }
}
