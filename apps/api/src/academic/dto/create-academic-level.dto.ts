import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAcademicLevelDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() code: string;
  @IsInt() order: number;
  @IsString() @IsOptional() description?: string;
}

export class CreateAcademicYearDto {
  @IsInt() year: number;
  @IsString() @IsNotEmpty() organizationId: string;
  @IsString() @IsNotEmpty() startDate: string;
  @IsString() @IsNotEmpty() endDate: string;
}

export class CreateTermDto {
  @IsString() @IsNotEmpty() name: string;
  @IsInt() number: number;
  @IsString() @IsNotEmpty() academicYearId: string;
  @IsString() @IsNotEmpty() startDate: string;
  @IsString() @IsNotEmpty() endDate: string;
}
