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
import { AssignmentsService } from './assignments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssignmentsController {
  constructor(private assignmentsService: AssignmentsService) {}

  @Get('me')
  @Roles(Role.STUDENT)
  getMySubmissions(@CurrentUser() user: User) {
    return this.assignmentsService.getMySubmissions(user.id);
  }

  @Get('courses/:courseId')
  findByCourse(@Param('courseId') courseId: string, @CurrentUser() user: User) {
    if (user.role === 'STUDENT')
      return this.assignmentsService.findPublished(courseId);
    return this.assignmentsService.findByCourse(courseId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assignmentsService.findOne(id);
  }

  @Post('courses/:courseId')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.TEACHER)
  create(
    @Param('courseId') courseId: string,
    @Body() dto: any,
    @CurrentUser() user: User,
  ) {
    return this.assignmentsService.create(courseId, user.id, dto);
  }

  @Patch(':id/publish')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.TEACHER)
  publish(@Param('id') id: string) {
    return this.assignmentsService.publish(id);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.TEACHER)
  remove(@Param('id') id: string) {
    return this.assignmentsService.remove(id);
  }

  @Post(':assignmentId/submit')
  @Roles(Role.STUDENT)
  submit(
    @Param('assignmentId') assignmentId: string,
    @Body() dto: any,
    @CurrentUser() user: User,
  ) {
    return this.assignmentsService.submit(assignmentId, user.id, dto);
  }

  @Get(':assignmentId/submissions')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.TEACHER)
  getSubmissions(@Param('assignmentId') assignmentId: string) {
    return this.assignmentsService.getSubmissions(assignmentId);
  }

  @Patch('submissions/:submissionId/grade')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.TEACHER)
  gradeSubmission(
    @Param('submissionId') submissionId: string,
    @Body() dto: { marks: number; feedback?: string },
  ) {
    return this.assignmentsService.gradeSubmission(
      submissionId,
      dto.marks,
      dto.feedback,
    );
  }
}
