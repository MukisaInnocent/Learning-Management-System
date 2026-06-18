import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Difficulty, QuestionType, Role, type User } from '@prisma/client';
import { QuestionBankService } from './question-bank.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('question-bank')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuestionBankController {
  constructor(private qbService: QuestionBankService) {}

  @Get()
  @Roles(
    Role.SUPER_ADMIN,
    Role.ORG_ADMIN,
    Role.TEACHER,
    Role.EXAMINER,
    Role.CONTENT_CREATOR,
  )
  findAll(
    @CurrentUser() user: User,
    @Query('subjectId') subjectId?: string,
    @Query('levelId') levelId?: string,
    @Query('difficulty') difficulty?: Difficulty,
    @Query('type') type?: QuestionType,
  ) {
    return this.qbService.findAll(user.organizationId, {
      subjectId,
      levelId,
      difficulty,
      type,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.qbService.findOne(id);
  }

  @Post()
  @Roles(
    Role.SUPER_ADMIN,
    Role.ORG_ADMIN,
    Role.TEACHER,
    Role.EXAMINER,
    Role.CONTENT_CREATOR,
  )
  create(
    @Body()
    dto: {
      text: string;
      type?: QuestionType;
      difficulty?: Difficulty;
      topic?: string;
      explanation?: string;
      marks?: number;
      subjectId?: string;
      levelId?: string;
      options?: { text: string; isCorrect: boolean }[];
    },
    @CurrentUser() user: User,
  ) {
    return this.qbService.create(user.organizationId, user.id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.TEACHER)
  remove(@Param('id') id: string) {
    return this.qbService.remove(id);
  }
}
