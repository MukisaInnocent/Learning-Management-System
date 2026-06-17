import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.subject.findMany({
      where: { organizationId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const subject = await this.prisma.subject.findUnique({ where: { id } });
    if (!subject) throw new NotFoundException('Subject not found');
    return subject;
  }

  async create(dto: { name: string; code: string }, organizationId: string) {
    const existing = await this.prisma.subject.findUnique({
      where: { organizationId_code: { organizationId, code: dto.code.toUpperCase() } },
    });
    if (existing) throw new ConflictException('Subject code already exists');
    return this.prisma.subject.create({
      data: { ...dto, code: dto.code.toUpperCase(), organizationId },
    });
  }

  async update(id: string, dto: { name?: string; code?: string }) {
    await this.findOne(id);
    return this.prisma.subject.update({
      where: { id },
      data: { ...dto, ...(dto.code ? { code: dto.code.toUpperCase() } : {}) },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.subject.delete({ where: { id } });
  }

  async seedDefaultSubjects(organizationId: string) {
    const defaults = [
      { name: 'Mathematics', code: 'MATH' },
      { name: 'English Language', code: 'ENG' },
      { name: 'Science', code: 'SCI' },
      { name: 'Social Studies', code: 'SST' },
      { name: 'Religious Education', code: 'RE' },
      { name: 'Physical Education', code: 'PE' },
      { name: 'ICT', code: 'ICT' },
      { name: 'Physics', code: 'PHY' },
      { name: 'Chemistry', code: 'CHEM' },
      { name: 'Biology', code: 'BIO' },
      { name: 'History', code: 'HIST' },
      { name: 'Geography', code: 'GEO' },
      { name: 'Agriculture', code: 'AGRIC' },
      { name: 'French', code: 'FRE' },
    ];
    for (const s of defaults) {
      await this.prisma.subject.upsert({
        where: { organizationId_code: { organizationId, code: s.code } },
        update: {},
        create: { ...s, organizationId },
      });
    }
    return this.findAll(organizationId);
  }
}
