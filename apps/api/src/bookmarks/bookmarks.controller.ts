import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import type { User } from '@prisma/client';
import { BookmarksService } from './bookmarks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('bookmarks')
@UseGuards(JwtAuthGuard)
export class BookmarksController {
  constructor(private bookmarksService: BookmarksService) {}

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.bookmarksService.findAll(user.id);
  }

  @Post('lessons/:lessonId/toggle')
  toggle(@Param('lessonId') lessonId: string, @CurrentUser() user: User) {
    return this.bookmarksService.toggle(lessonId, user.id);
  }

  @Get('lessons/:lessonId')
  isBookmarked(@Param('lessonId') lessonId: string, @CurrentUser() user: User) {
    return this.bookmarksService.isBookmarked(lessonId, user.id);
  }
}
