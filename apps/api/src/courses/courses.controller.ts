import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { Role, type User } from '@prisma/client';
import { CoursesService } from './courses.service';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CreateModuleDto,
  UpdateModuleDto,
  CreateLessonDto,
  UpdateLessonDto,
} from './dto/course.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  // ─── Courses ─────────────────────────────────────────────────────────────

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.TEACHER)
  create(@Body() dto: CreateCourseDto, @CurrentUser() user: User) {
    return this.coursesService.create(dto, user.id, user.organizationId);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.coursesService.findAll(user.organizationId, user.id, user.role);
  }

  @Get('enrollments/mine')
  getMyEnrollments(@CurrentUser() user: User) {
    return this.coursesService.getMyEnrollments(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.TEACHER)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
    @CurrentUser() user: User,
  ) {
    return this.coursesService.update(id, dto, user.id, user.role);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN)
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }

  @Post(':id/enroll')
  @Roles(Role.STUDENT)
  enroll(@Param('id') id: string, @CurrentUser() user: User) {
    return this.coursesService.enroll(id, user.id);
  }

  // ─── Modules ─────────────────────────────────────────────────────────────

  @Post(':courseId/modules')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.TEACHER)
  createModule(
    @Param('courseId') courseId: string,
    @Body() dto: CreateModuleDto,
  ) {
    return this.coursesService.createModule(courseId, dto);
  }

  @Patch('modules/:moduleId')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.TEACHER)
  updateModule(
    @Param('moduleId') moduleId: string,
    @Body() dto: UpdateModuleDto,
  ) {
    return this.coursesService.updateModule(moduleId, dto);
  }

  @Delete('modules/:moduleId')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.TEACHER)
  removeModule(@Param('moduleId') moduleId: string) {
    return this.coursesService.removeModule(moduleId);
  }

  // ─── Lessons ─────────────────────────────────────────────────────────────

  @Post('modules/:moduleId/lessons')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.TEACHER)
  createLesson(
    @Param('moduleId') moduleId: string,
    @Body() dto: CreateLessonDto,
  ) {
    return this.coursesService.createLesson(moduleId, dto);
  }

  @Get('lessons/:lessonId')
  findLesson(@Param('lessonId') lessonId: string) {
    return this.coursesService.findLesson(lessonId);
  }

  @Patch('lessons/:lessonId')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.TEACHER)
  updateLesson(
    @Param('lessonId') lessonId: string,
    @Body() dto: UpdateLessonDto,
  ) {
    return this.coursesService.updateLesson(lessonId, dto);
  }

  @Delete('lessons/:lessonId')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.TEACHER)
  removeLesson(@Param('lessonId') lessonId: string) {
    return this.coursesService.removeLesson(lessonId);
  }
}
