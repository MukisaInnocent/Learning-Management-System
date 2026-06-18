import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { Role, type User } from '@prisma/client';
import { ParentsService } from './parents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('parents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ParentsController {
  constructor(private parentsService: ParentsService) {}

  @Get('children')
  @Roles(Role.PARENT)
  getMyChildren(@CurrentUser() user: User) {
    return this.parentsService.getMyChildren(user.id);
  }

  @Get('children/:studentId')
  @Roles(Role.PARENT)
  getChildDetail(
    @CurrentUser() user: User,
    @Param('studentId') studentId: string,
  ) {
    return this.parentsService.getChildDetail(user.id, studentId);
  }

  @Patch('profile')
  @Roles(Role.PARENT)
  updateProfile(
    @CurrentUser() user: User,
    @Body() dto: { phone?: string; address?: string; occupation?: string },
  ) {
    return this.parentsService.upsertProfile(user.id, dto);
  }
}
