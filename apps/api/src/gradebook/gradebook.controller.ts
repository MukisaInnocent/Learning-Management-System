import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { Role, type User } from '@prisma/client';
import { GradebookService } from './gradebook.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('gradebook')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GradebookController {
  constructor(private gradebookService: GradebookService) {}

  @Get('categories')
  getCategories(@CurrentUser() user: User) {
    return this.gradebookService.getCategories(user.organizationId);
  }

  @Post('categories')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN)
  createCategory(
    @CurrentUser() user: User,
    @Body() dto: { name: string; weight: number },
  ) {
    return this.gradebookService.createCategory(user.organizationId, dto);
  }

  @Delete('categories/:id')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN)
  deleteCategory(@Param('id') id: string) {
    return this.gradebookService.deleteCategory(id);
  }

  @Get('scales')
  getScales(@CurrentUser() user: User) {
    return this.gradebookService.getScales(user.organizationId);
  }

  @Post('scales/seed')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN)
  seedScales(@CurrentUser() user: User) {
    return this.gradebookService.seedDefaultScales(user.organizationId);
  }

  @Post('grades')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.TEACHER)
  addGrade(@Body() dto: any) {
    return this.gradebookService.addGrade(dto);
  }

  @Get('courses/:courseId/terms/:termId')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.TEACHER)
  getGradesForCourse(
    @Param('courseId') courseId: string,
    @Param('termId') termId: string,
  ) {
    return this.gradebookService.getGradesForCourse(courseId, termId);
  }

  @Get('my-grades')
  @Roles(Role.STUDENT)
  getMyGrades(@CurrentUser() user: User) {
    return this.gradebookService.getMyGrades(user.id);
  }

  @Get('results/me')
  @Roles(Role.STUDENT)
  getMyResults(@CurrentUser() user: User) {
    return this.gradebookService.getResults(user.id);
  }

  @Get('results/:studentId')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.TEACHER)
  getStudentResults(@Param('studentId') studentId: string) {
    return this.gradebookService.getResults(studentId);
  }

  @Post('results/compute')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.TEACHER)
  computeResult(
    @Body() dto: { studentId: string; courseId: string; termId: string },
    @CurrentUser() user: User,
  ) {
    return this.gradebookService.computeAndSaveResult(
      dto.studentId,
      dto.courseId,
      dto.termId,
      user.organizationId,
    );
  }
}
