import { Body, Controller, Get, Param, Patch, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { AdminDiscoveryUpdateDto, DiscoverySearchQueryDto } from './discovery.dto';
import { DiscoveryService } from './discovery.service';

@ApiTags('Admin Discovery')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@Controller('admin/discovery')
export class AdminDiscoveryController {
  constructor(private readonly discovery: DiscoveryService) {}

  @Get('listings')
  @ApiOperation({ summary: 'Admin search of discovery listings' })
  list(@Query() query: DiscoverySearchQueryDto) {
    return this.discovery.adminList(query);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Discovery analytics summary' })
  analytics() {
    return this.discovery.adminAnalytics();
  }

  @Get('categories')
  categories() {
    return this.discovery.getCategories();
  }

  @Patch('listings/:type/:id')
  @ApiOperation({ summary: 'Verify, feature, hide, or update public visibility' })
  update(
    @Param('type') type: string,
    @Param('id') id: string,
    @Body() body: AdminDiscoveryUpdateDto,
    @Request() req: { user?: { id: string } },
  ) {
    return this.discovery.adminUpdate(id, type, body, req.user!.id);
  }
}
