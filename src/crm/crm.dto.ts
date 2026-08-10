import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCrmLeadDto {
  @IsString() firstName: string;
  @IsString() lastName: string;
  @IsOptional() @IsString() profilePhoto?: string;
  @IsOptional() @IsString() gender?: string;
  @IsOptional() @IsString() dateOfBirth?: string;
  @IsString() email: string;
  @IsString() phone: string;
  @IsOptional() @IsString() alternatePhone?: string;
  @IsOptional() @IsString() whatsapp?: string;
  @IsOptional() @IsString() website?: string;
  @IsString() company: string;
  @IsOptional() @IsString() jobTitle?: string;
  @IsOptional() @IsString() industry?: string;
  @IsOptional() @IsString() companySize?: string;
  @IsOptional() @IsString() gstNumber?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() postalCode?: string;
  @IsOptional() @IsString() address?: string;
  @IsString() leadType: string;
  @IsString() leadSource: string;
  @IsString() priority: string;
  @IsOptional() @IsString() leadStatus?: string;
  @IsOptional() @IsString() assignedToId?: string;
  @IsOptional() @IsString() dealCurrency?: string;
  @IsOptional() @IsNumber() dealValue?: number;
  @IsOptional() @IsString() nextFollowUpDate?: string;
  @IsOptional() @IsString() nextFollowUpTime?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() internalNotes?: string;
  @IsOptional() @IsArray() tags?: string[];
}

export class UpdateCrmLeadDto extends CreateCrmLeadDto {}

export class CreateCrmNoteDto {
  @IsString() content: string;
}

export class UpdateCrmNoteDto {
  @IsString() content: string;
}

export class CreateCrmFollowUpDto {
  @IsString() title: string;
  @IsString() date: string;
  @IsString() time: string;
  @IsOptional() @IsString() notes?: string;
}

export class CrmLeadQueryDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() leadStatus?: string;
  @IsOptional() @IsString() leadType?: string;
  @IsOptional() @IsString() priority?: string;
  @IsOptional() @IsString() assignedToId?: string;
  @IsOptional() @IsString() source?: string;
  @IsOptional() @IsString() dateFrom?: string;
  @IsOptional() @IsString() dateTo?: string;
  @IsOptional() @IsString() sort?: string;
  @IsOptional() @IsString() page?: string;
  @IsOptional() @IsString() limit?: string;
}
