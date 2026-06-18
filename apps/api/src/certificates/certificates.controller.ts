import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { Role, type User } from '@prisma/client';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('certificates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CertificatesController {
  constructor(private certificatesService: CertificatesService) {}

  @Get('mine')
  @Roles(Role.STUDENT)
  getMyCertificates(@CurrentUser() user: User) {
    return this.certificatesService.getMyCertificates(user.id);
  }

  @Get('verify/:code')
  verify(@Param('code') code: string) {
    return this.certificatesService.verify(code);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN)
  findAll(@CurrentUser() user: User) {
    return this.certificatesService.findAll(user.organizationId);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN)
  issue(@Body() dto: { studentId: string; courseId: string }) {
    return this.certificatesService.issueCertificate(
      dto.studentId,
      dto.courseId,
    );
  }
}
