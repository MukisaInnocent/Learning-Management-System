import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType } from '@prisma/client';

export class CreateOptionDto {
  @IsString() @IsNotEmpty() text: string;
  @IsNotEmpty() isCorrect: boolean;
  @IsInt() order: number;
}

export class CreateQuestionDto {
  @IsString() @IsNotEmpty() text: string;
  @IsEnum(QuestionType) @IsOptional() type?: QuestionType;
  @IsNumber() @IsOptional() points?: number;
  @IsInt() order: number;
  @IsString() @IsOptional() explanation?: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOptionDto)
  options: CreateOptionDto[];
}

export class CreateQuizDto {
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsOptional() description?: string;
  @IsString() @IsOptional() lessonId?: string;
  @IsString() @IsOptional() courseId?: string;
  @IsInt() @IsOptional() timeLimit?: number;
  @IsNumber() @IsOptional() passingScore?: number;
  @IsInt() @IsOptional() maxAttempts?: number;
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions?: CreateQuestionDto[];
}

export class SubmitAnswerDto {
  @IsString() @IsNotEmpty() questionId: string;
  @IsString() @IsOptional() selectedOptionId?: string;
  @IsString() @IsOptional() textAnswer?: string;
}

export class SubmitAttemptDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitAnswerDto)
  answers: SubmitAnswerDto[];
}
