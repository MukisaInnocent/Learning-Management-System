import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto, SubmitAttemptDto } from './dto/quiz.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('quizzes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuizzesController {
  constructor(private quizzesService: QuizzesService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.TEACHER)
  create(@Body() dto: CreateQuizDto) {
    return this.quizzesService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    if (user.role === Role.STUDENT) {
      return this.quizzesService.findForStudent(id);
    }
    return this.quizzesService.findOne(id);
  }

  @Post(':id/attempts/start')
  @Roles(Role.STUDENT)
  startAttempt(@Param('id') id: string, @CurrentUser() user: any) {
    return this.quizzesService.startAttempt(id, user.id);
  }

  @Post('attempts/:attemptId/submit')
  @Roles(Role.STUDENT)
  submitAttempt(
    @Param('attemptId') attemptId: string,
    @CurrentUser() user: any,
    @Body() dto: SubmitAttemptDto,
  ) {
    return this.quizzesService.submitAttempt(attemptId, user.id, dto);
  }

  @Get(':id/attempts/mine')
  @Roles(Role.STUDENT)
  getMyAttempts(@Param('id') id: string, @CurrentUser() user: any) {
    return this.quizzesService.getMyAttempts(id, user.id);
  }
}
