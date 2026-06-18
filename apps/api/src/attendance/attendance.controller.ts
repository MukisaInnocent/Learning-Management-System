import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { Role, type User } from '@prisma/client';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Post('mark')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.TEACHER)
  mark(@Body('records') records: any[]) {
    return this.attendanceService.markAttendance(records);
  }

  @Get('date')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.TEACHER)
  getForDate(
    @CurrentUser() user: User,
    @Query('date') date: string,
    @Query('termId') termId: string,
  ) {
    return this.attendanceService.getAttendanceForDate(
      user.organizationId,
      date,
      termId,
    );
  }

  @Get('students/:studentId')
  getStudentAttendance(
    @Param('studentId') studentId: string,
    @Query('termId') termId?: string,
  ) {
    return this.attendanceService.getStudentAttendance(studentId, termId);
  }

  @Get('students/:studentId/summary')
  getSummary(
    @Param('studentId') studentId: string,
    @Query('termId') termId: string,
  ) {
    return this.attendanceService.getSummary(studentId, termId);
  }

  @Get('me')
  @Roles(Role.STUDENT)
  getMyAttendance(@CurrentUser() user: User, @Query('termId') termId?: string) {
    return this.attendanceService.getStudentAttendance(user.id, termId);
  }
}
