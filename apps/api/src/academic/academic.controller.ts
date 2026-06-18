import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { Role, type User } from '@prisma/client';
import { AcademicService } from './academic.service';
import {
  CreateAcademicLevelDto,
  CreateAcademicYearDto,
  CreateTermDto,
} from './dto/create-academic-level.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('academic')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AcademicController {
  constructor(private academicService: AcademicService) {}

  @Get('levels')
  findAllLevels() {
    return this.academicService.findAllLevels();
  }

  @Post('levels')
  @Roles(Role.SUPER_ADMIN)
  createLevel(@Body() dto: CreateAcademicLevelDto) {
    return this.academicService.createLevel(dto);
  }

  @Post('levels/seed')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN)
  seedLevels() {
    return this.academicService.seedDefaultLevels();
  }

  @Get('years')
  findYears(@CurrentUser() user: User) {
    return this.academicService.findYears(user.organizationId);
  }

  @Post('years')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN)
  createYear(@Body() dto: CreateAcademicYearDto) {
    return this.academicService.createYear(dto);
  }

  @Patch('years/:id/current')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN)
  setCurrentYear(@Param('id') id: string, @CurrentUser() user: User) {
    return this.academicService.setCurrentYear(id, user.organizationId);
  }

  @Get('years/:yearId/terms')
  findTerms(@Param('yearId') yearId: string) {
    return this.academicService.findTerms(yearId);
  }

  @Post('terms')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN)
  createTerm(@Body() dto: CreateTermDto) {
    return this.academicService.createTerm(dto);
  }
}
