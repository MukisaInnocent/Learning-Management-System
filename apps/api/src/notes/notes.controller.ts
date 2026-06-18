import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { NotesService } from './notes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IsString, IsNotEmpty } from 'class-validator';

class UpsertNoteDto {
  @IsString() @IsNotEmpty() content: string;
}

@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private notesService: NotesService) {}

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.notesService.findAll(user.id);
  }

  @Get('lesson/:lessonId')
  findByLesson(@Param('lessonId') lessonId: string, @CurrentUser() user: User) {
    return this.notesService.findByLesson(lessonId, user.id);
  }

  @Post('lesson/:lessonId')
  upsert(
    @Param('lessonId') lessonId: string,
    @Body() dto: UpsertNoteDto,
    @CurrentUser() user: User,
  ) {
    return this.notesService.upsert(lessonId, user.id, dto.content);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.notesService.remove(id, user.id);
  }
}
