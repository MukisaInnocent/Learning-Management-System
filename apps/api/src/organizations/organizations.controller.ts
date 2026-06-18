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
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationsController {
  constructor(private orgsService: OrganizationsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN)
  create(@Body() dto: CreateOrganizationDto) {
    return this.orgsService.create(dto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN)
  findAll() {
    return this.orgsService.findAll();
  }

  @Get('mine')
  findMine(@CurrentUser() user: User) {
    return this.orgsService.findOne(user.organizationId);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN)
  findOne(@Param('id') id: string) {
    return this.orgsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN)
  update(@Param('id') id: string, @Body() dto: Partial<CreateOrganizationDto>) {
    return this.orgsService.update(id, dto);
  }

  @Get(':id/members')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN)
  getMembers(@Param('id') id: string) {
    return this.orgsService.getMembers(id);
  }

  @Delete(':id/members/:userId')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN)
  removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.orgsService.removeMember(id, userId);
  }
}
