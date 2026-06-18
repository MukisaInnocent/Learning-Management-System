import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private progressService: ProgressService) {}

  @Get('dashboard')
  getDashboard(@CurrentUser() user: User) {
    return this.progressService.getDashboard(user.id);
  }

  @Post('lessons/:lessonId/complete')
  markComplete(@Param('lessonId') lessonId: string, @CurrentUser() user: User) {
    return this.progressService.markLessonProgress(lessonId, user.id);
  }

  @Patch('lessons/:lessonId/watch')
  updateWatch(
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: User,
    @Body('watchedSeconds') watchedSeconds: number,
  ) {
    return this.progressService.updateWatchProgress(
      lessonId,
      user.id,
      watchedSeconds,
    );
  }

  @Get('lessons/:lessonId')
  getLessonProgress(
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: User,
  ) {
    return this.progressService.getLessonProgress(lessonId, user.id);
  }

  @Get('courses/:courseId')
  getCourseProgress(
    @Param('courseId') courseId: string,
    @CurrentUser() user: User,
  ) {
    return this.progressService.getCourseProgress(courseId, user.id);
  }
}
