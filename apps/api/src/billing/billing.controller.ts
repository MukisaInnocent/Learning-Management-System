import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { InvoiceStatus, Role } from '@prisma/client';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('billing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BillingController {
  constructor(private billingService: BillingService) {}

  @Get('summary')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN)
  getSummary(@CurrentUser() user: any) {
    return this.billingService.getFinancialSummary(user.organizationId);
  }

  @Get('fee-structures')
  getFeeStructures(@CurrentUser() user: any) {
    return this.billingService.getFeeStructures(user.organizationId);
  }

  @Post('fee-structures')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN)
  createFeeStructure(@Body() dto: any, @CurrentUser() user: any) {
    return this.billingService.createFeeStructure(user.organizationId, dto);
  }

  @Get('invoices')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN)
  findInvoices(@CurrentUser() user: any, @Query('status') status?: InvoiceStatus) {
    return this.billingService.findInvoices(user.organizationId, status);
  }

  @Get('invoices/mine')
  @Roles(Role.STUDENT)
  getMyInvoices(@CurrentUser() user: any) {
    return this.billingService.getMyInvoices(user.id);
  }

  @Get('invoices/:id')
  findOne(@Param('id') id: string) {
    return this.billingService.findOne(id);
  }

  @Post('invoices')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN)
  createInvoice(@Body() dto: any, @CurrentUser() user: any) {
    return this.billingService.createInvoice(user.organizationId, dto);
  }

  @Patch('invoices/:id/status')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN)
  updateStatus(@Param('id') id: string, @Body('status') status: InvoiceStatus) {
    return this.billingService.updateStatus(id, status);
  }

  @Post('invoices/:id/payments')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN)
  recordPayment(@Param('id') id: string, @Body() dto: any) {
    return this.billingService.recordPayment(id, dto);
  }
}
