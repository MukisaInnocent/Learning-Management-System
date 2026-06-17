import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class CertificatesService {
  constructor(private prisma: PrismaService) {}

  private generateVerificationCode() {
    return randomBytes(8).toString('hex').toUpperCase();
  }

  private generateCertificateNumber() {
    return `CERT-${new Date().getFullYear()}-${randomBytes(4).toString('hex').toUpperCase()}`;
  }

  async issueCertificate(studentId: string, courseId: string) {
    const existing = await this.prisma.certificate.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });
    if (existing) throw new ConflictException('Certificate already issued for this course');

    return this.prisma.certificate.create({
      data: {
        studentId,
        courseId,
        certificateNumber: this.generateCertificateNumber(),
        verificationCode: this.generateVerificationCode(),
      },
      include: {
        student: { select: { firstName: true, lastName: true, email: true } },
        course: { select: { title: true } },
      },
    });
  }

  async getMyCertificates(studentId: string) {
    return this.prisma.certificate.findMany({
      where: { studentId },
      include: { course: { select: { id: true, title: true, academicLevel: true } } },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async verify(verificationCode: string) {
    const cert = await this.prisma.certificate.findUnique({
      where: { verificationCode },
      include: {
        student: { select: { firstName: true, lastName: true } },
        course: { select: { title: true } },
      },
    });
    if (!cert) throw new NotFoundException('Certificate not found or invalid code');
    return { valid: true, certificate: cert };
  }

  async findAll(organizationId: string) {
    return this.prisma.certificate.findMany({
      where: { student: { organizationId } },
      include: {
        student: { select: { firstName: true, lastName: true, email: true } },
        course: { select: { id: true, title: true } },
      },
      orderBy: { issuedAt: 'desc' },
    });
  }
}
