import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import {
  CreateSupportCaseDto,
  ResolveSupportDto,
  SearchQueryDto,
  SendMessageDto,
} from './support.dto';
import { SupportService } from './support.service';

@ApiTags('Support')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Roles('BRAND', 'CREATOR', 'ADMIN', 'SUPER_ADMIN')
@Controller('support')
export class SupportController {
  constructor(private readonly support: SupportService) {}

  private userRole(req: { user?: { role?: { name?: string } } }) {
    return req.user?.role?.name ?? 'CREATOR';
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get support categories for current user role' })
  getCategories(@Request() req: { user?: { role?: { name?: string } } }) {
    return this.support.getCategories(this.userRole(req));
  }

  @Get('categories/:categoryId')
  getCategory(
    @Param('categoryId') categoryId: string,
    @Request() req: { user?: { role?: { name?: string } } },
  ) {
    return this.support.getCategory(categoryId, this.userRole(req));
  }

  @Get('issues/:issueId')
  getIssue(
    @Param('issueId') issueId: string,
    @Request() req: { user?: { role?: { name?: string } } },
  ) {
    return this.support.getIssue(issueId, this.userRole(req));
  }

  @Get('search')
  search(
    @Query() query: SearchQueryDto,
    @Request() req: { user?: { role?: { name?: string } } },
  ) {
    return this.support.search(this.userRole(req), query.q);
  }

  @Post('resolve')
  resolve(
    @Body() body: ResolveSupportDto,
    @Request() req: { user?: { id: string; role?: { name?: string } } },
  ) {
    return this.support.resolve(req.user!.id, this.userRole(req), body);
  }

  @Post('cases')
  createCase(
    @Body() body: CreateSupportCaseDto,
    @Request() req: { user?: { id: string; role?: { name?: string } } },
  ) {
    return this.support.createCase(req.user!.id, this.userRole(req), body);
  }

  @Get('cases')
  getCases(@Request() req: { user?: { id: string } }) {
    return this.support.getUserCases(req.user!.id);
  }

  @Get('cases/:caseId')
  getCase(
    @Param('caseId') caseId: string,
    @Request() req: { user?: { id: string } },
  ) {
    return this.support.getUserCase(req.user!.id, caseId);
  }

  @Post('cases/:caseId/messages')
  sendMessage(
    @Param('caseId') caseId: string,
    @Body() body: SendMessageDto,
    @Request() req: { user?: { id: string; role?: { name?: string } } },
  ) {
    return this.support.sendMessage(req.user!.id, this.userRole(req), caseId, body.message);
  }
}
