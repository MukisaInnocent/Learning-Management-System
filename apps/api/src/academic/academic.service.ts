import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateAcademicLevelDto,
  CreateAcademicYearDto,
  CreateTermDto,
} from './dto/create-academic-level.dto';

@Injectable()
export class AcademicService {
  constructor(private prisma: PrismaService) {}

  // ─── Academic Levels ───────────────────────────────────────────────────────

  async createLevel(dto: CreateAcademicLevelDto) {
    return this.prisma.academicLevel.create({ data: dto });
  }

  async findAllLevels() {
    return this.prisma.academicLevel.findMany({ orderBy: { order: 'asc' } });
  }

  async seedDefaultLevels() {
    const defaults = [
      { name: 'Nursery', code: 'NURSERY', order: 0 },
      { name: 'Primary 1', code: 'P1', order: 1 },
      { name: 'Primary 2', code: 'P2', order: 2 },
      { name: 'Primary 3', code: 'P3', order: 3 },
      { name: 'Primary 4', code: 'P4', order: 4 },
      { name: 'Primary 5', code: 'P5', order: 5 },
      { name: 'Primary 6', code: 'P6', order: 6 },
      { name: 'Primary 7', code: 'P7', order: 7 },
      { name: 'Senior 1', code: 'S1', order: 8 },
      { name: 'Senior 2', code: 'S2', order: 9 },
      { name: 'Senior 3', code: 'S3', order: 10 },
      { name: 'Senior 4', code: 'S4', order: 11 },
      { name: 'Senior 5', code: 'S5', order: 12 },
      { name: 'Senior 6', code: 'S6', order: 13 },
    ];

    for (const level of defaults) {
      await this.prisma.academicLevel.upsert({
        where: { code: level.code },
        update: {},
        create: level,
      });
    }
    return this.findAllLevels();
  }

  // ─── Academic Years ────────────────────────────────────────────────────────

  async createYear(dto: CreateAcademicYearDto) {
    return this.prisma.academicYear.create({
      data: {
        ...dto,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      },
    });
  }

  async findYears(organizationId: string) {
    return this.prisma.academicYear.findMany({
      where: { organizationId },
      include: { terms: { orderBy: { number: 'asc' } } },
      orderBy: { year: 'desc' },
    });
  }

  async setCurrentYear(id: string, organizationId: string) {
    await this.prisma.academicYear.updateMany({
      where: { organizationId },
      data: { isCurrent: false },
    });
    return this.prisma.academicYear.update({
      where: { id },
      data: { isCurrent: true },
    });
  }

  // ─── Terms ─────────────────────────────────────────────────────────────────

  async createTerm(dto: CreateTermDto) {
    return this.prisma.term.create({
      data: {
        ...dto,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      },
    });
  }

  async findTerms(academicYearId: string) {
    return this.prisma.term.findMany({
      where: { academicYearId },
      orderBy: { number: 'asc' },
    });
  }
}
