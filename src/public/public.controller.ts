import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PublicCampaignsQueryDto, PublicCreatorsQueryDto } from './public.dto';
import { PublicService } from './public.service';

@ApiTags('Public')
@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('creators')
  @ApiOperation({ summary: 'List public creators (no auth required)' })
  listCreators(@Query() query: PublicCreatorsQueryDto) {
    return this.publicService.listCreators(query);
  }

  @Get('creators/:username')
  @ApiOperation({ summary: 'Get public creator profile by username (no auth required)' })
  getCreator(@Param('username') username: string) {
    return this.publicService.getCreatorByUsername(username);
  }

  @Get('campaigns')
  @ApiOperation({ summary: 'List public campaigns (no auth required)' })
  listCampaigns(@Query() query: PublicCampaignsQueryDto) {
    return this.publicService.listCampaigns(query);
  }

  @Get('campaigns/:id')
  @ApiOperation({ summary: 'Get public campaign details (no auth required)' })
  getCampaign(@Param('id') id: string) {
    return this.publicService.getCampaignById(id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get platform statistics (no auth required)' })
  getStats() {
    return this.publicService.getPlatformStats();
  }
}
