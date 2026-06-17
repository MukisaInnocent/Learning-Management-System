import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.TEACHER)
  findAll(@CurrentUser() user: any) {
    return this.studentsService.findAll(user.organizationId);
  }

  @Get('profile')
  getMyProfile(@CurrentUser() user: any) {
    return this.studentsService.findOne(user.id);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.TEACHER)
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Patch('profile')
  updateMyProfile(@CurrentUser() user: any, @Body() dto: any) {
    return this.studentsService.upsertProfile(user.id, dto);
  }

  @Post(':studentId/link-parent/:parentId')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN)
  linkParent(@Param('studentId') studentId: string, @Param('parentId') parentId: string, @Body('relationship') rel?: string) {
    return this.studentsService.linkParent(studentId, parentId, rel);
  }
}
