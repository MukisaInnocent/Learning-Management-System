import { Injectable, NotFoundException } from '@nestjs/common';
import { BillingType, InvoiceStatus, PaymentMethod } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  // ─── Fee Structures ───────────────────────────────────────────────────────

  async getFeeStructures(organizationId: string) {
    return this.prisma.feeStructure.findMany({
      where: { organizationId, active: true },
      orderBy: { name: 'asc' },
    });
  }

  async createFeeStructure(
    organizationId: string,
    dto: {
      name: string;
      billingType: BillingType;
      amount: number;
      description?: string;
    },
  ) {
    return this.prisma.feeStructure.create({
      data: { ...dto, organizationId },
    });
  }

  // ─── Invoices ─────────────────────────────────────────────────────────────

  private nextInvoiceNumber() {
    return `INV-${Date.now()}-${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0')}`;
  }

  async createInvoice(
    organizationId: string,
    dto: {
      studentId?: string;
      amount: number;
      dueDate?: string;
      notes?: string;
      items: { description: string; quantity: number; amount: number }[];
    },
  ) {
    return this.prisma.invoice.create({
      data: {
        organizationId,
        studentId: dto.studentId,
        invoiceNumber: this.nextInvoiceNumber(),
        amount: dto.amount,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        notes: dto.notes,
        items: { create: dto.items },
      },
      include: {
        items: true,
        student: { select: { firstName: true, lastName: true, email: true } },
      },
    });
  }

  async findInvoices(organizationId: string, status?: InvoiceStatus) {
    return this.prisma.invoice.findMany({
      where: { organizationId, ...(status ? { status } : {}) },
      include: {
        student: { select: { firstName: true, lastName: true, email: true } },
        items: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const inv = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        items: true,
        payments: true,
        student: { select: { firstName: true, lastName: true, email: true } },
      },
    });
    if (!inv) throw new NotFoundException('Invoice not found');
    return inv;
  }

  async updateStatus(id: string, status: InvoiceStatus) {
    return this.prisma.invoice.update({ where: { id }, data: { status } });
  }

  async recordPayment(
    invoiceId: string,
    dto: {
      amount: number;
      method: PaymentMethod;
      referenceNumber?: string;
      notes?: string;
    },
  ) {
    const payment = await this.prisma.payment.create({
      data: {
        invoiceId,
        amount: dto.amount,
        method: dto.method,
        referenceNumber: dto.referenceNumber,
        notes: dto.notes,
      },
    });

    const invoice = await this.findOne(invoiceId);
    const totalPaid =
      invoice.payments.reduce((a, p) => a + Number(p.amount), 0) +
      Number(dto.amount);
    const invoiceAmount = Number(invoice.amount);
    const newStatus =
      totalPaid >= invoiceAmount ? InvoiceStatus.PAID : InvoiceStatus.PARTIAL;
    await this.updateStatus(invoiceId, newStatus);

    return payment;
  }

  async getFinancialSummary(organizationId: string) {
    const [invoices, payments] = await Promise.all([
      this.prisma.invoice.findMany({
        where: { organizationId },
        include: { payments: true },
      }),
      this.prisma.payment.findMany({ where: { invoice: { organizationId } } }),
    ]);
    const totalRevenue = payments.reduce((a, p) => a + Number(p.amount), 0);
    const totalOutstanding = invoices
      .filter((i) => i.status !== InvoiceStatus.PAID)
      .reduce((a, i) => a + Number(i.amount), 0);
    const overdue = invoices.filter(
      (i) => i.status === InvoiceStatus.OVERDUE,
    ).length;
    return {
      totalRevenue,
      totalOutstanding,
      overdue,
      totalInvoices: invoices.length,
    };
  }

  async getMyInvoices(studentId: string) {
    return this.prisma.invoice.findMany({
      where: { studentId },
      include: { items: true, payments: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
