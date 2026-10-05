import { Body, Controller, Get, Headers, Param, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { DiscoveryEnquiryDto, DiscoveryEventDto, DiscoverySearchQueryDto } from './discovery.dto';
import { DiscoveryService } from './discovery.service';

@ApiTags('Business Discovery')
@Controller('business')
export class DiscoveryController {
  constructor(private readonly discovery: DiscoveryService) {}

  @Get('categories')
  @ApiOperation({ summary: 'List discovery categories' })
  getCategories(@Query('type') type?: string) {
    return this.discovery.getCategories(type);
  }

  @Get('locations')
  @ApiOperation({ summary: 'List discovery cities and areas' })
  getLocations() {
    return this.discovery.getLocations();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search businesses and creators' })
  search(@Query() query: DiscoverySearchQueryDto) {
    return this.discovery.search(query);
  }

  @Post('events')
  @ApiOperation({ summary: 'Track anonymous discovery analytics' })
  track(@Body() body: DiscoveryEventDto) {
    return this.discovery.trackEvent(body);
  }

  @Post(':slug/enquiry')
  @Throttle({ default: { limit: 8, ttl: 60000 } })
  @ApiOperation({ summary: 'Send a public enquiry to a listing' })
  enquiry(
    @Param('slug') slug: string,
    @Body() body: DiscoveryEnquiryDto,
    @Headers('authorization') authorization?: string,
    @Req() req?: { ip?: string; headers?: Record<string, string | string[] | undefined> },
  ) {
    const forwarded = req?.headers?.['x-forwarded-for'];
    const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0]?.trim() || req?.ip;
    return this.discovery.createEnquiry(slug, body, authorization, ip);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a public business or creator discovery profile' })
  getProfile(@Param('slug') slug: string) {
    return this.discovery.getBySlug(slug);
  }
}
