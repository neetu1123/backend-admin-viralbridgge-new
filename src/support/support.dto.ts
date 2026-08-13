import { IsOptional, IsString } from 'class-validator';

export class CreateSupportCaseDto {
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsString() subcategoryId?: string;
  @IsOptional() @IsString() issueId?: string;
  @IsString() subject: string;
  @IsString() description: string;
  @IsOptional() @IsString() caseType?: string;
  @IsOptional() @IsString() priority?: string;
  @IsOptional() @IsString() campaignId?: string;
  @IsOptional() @IsString() paymentId?: string;
  @IsOptional() @IsString() transactionId?: string;
  @IsOptional() contextJson?: Record<string, unknown>;
}

export class ResolveSupportDto {
  @IsString() issueId: string;
  @IsOptional() @IsString() campaignId?: string;
  @IsOptional() @IsString() paymentId?: string;
}

export class SendMessageDto {
  @IsString() message: string;
}

export class AdminUpdateCaseDto {
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() priority?: string;
  @IsOptional() @IsString() assignedAdminId?: string;
}

export class AdminAssignDto {
  @IsString() adminId: string;
}

export class AdminNoteDto {
  @IsString() note: string;
}

export class AdminCaseQueryDto {
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() priority?: string;
  @IsOptional() @IsString() caseType?: string;
  @IsOptional() @IsString() assignedAdminId?: string;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() tab?: string;
  @IsOptional() @IsString() page?: string;
  @IsOptional() @IsString() limit?: string;
}

export class SearchQueryDto {
  @IsString() q: string;
}
