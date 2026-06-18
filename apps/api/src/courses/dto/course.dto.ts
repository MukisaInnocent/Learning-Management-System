import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';
import { ContentStatus, LessonType } from '@prisma/client';

export class CreateCourseDto {
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsOptional() description?: string;
  @IsString() @IsOptional() coverUrl?: string;
  @IsEnum(ContentStatus) @IsOptional() status?: ContentStatus;
  @IsString() @IsOptional() academicLevelId?: string;
}

export class UpdateCourseDto {
  @IsString() @IsOptional() title?: string;
  @IsString() @IsOptional() description?: string;
  @IsString() @IsOptional() coverUrl?: string;
  @IsEnum(ContentStatus) @IsOptional() status?: ContentStatus;
  @IsString() @IsOptional() academicLevelId?: string;
}

export class CreateModuleDto {
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsOptional() description?: string;
  @IsInt() order: number;
}

export class UpdateModuleDto {
  @IsString() @IsOptional() title?: string;
  @IsString() @IsOptional() description?: string;
  @IsInt() @IsOptional() order?: number;
}

export class CreateLessonDto {
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsOptional() description?: string;
  @IsEnum(LessonType) @IsOptional() type?: LessonType;
  @IsInt() order: number;
  @IsInt() @IsOptional() durationMinutes?: number;
  @IsString() @IsOptional() videoUrl?: string;
  @IsString() @IsOptional() documentUrl?: string;
  @IsString() @IsOptional() content?: string;
  @IsString() @IsOptional() externalUrl?: string;
  @IsBoolean() @IsOptional() isPreview?: boolean;
}

export class UpdateLessonDto {
  @IsString() @IsOptional() title?: string;
  @IsString() @IsOptional() description?: string;
  @IsEnum(LessonType) @IsOptional() type?: LessonType;
  @IsInt() @IsOptional() order?: number;
  @IsInt() @IsOptional() durationMinutes?: number;
  @IsString() @IsOptional() videoUrl?: string;
  @IsString() @IsOptional() documentUrl?: string;
  @IsString() @IsOptional() content?: string;
  @IsString() @IsOptional() externalUrl?: string;
  @IsBoolean() @IsOptional() isPreview?: boolean;
}
