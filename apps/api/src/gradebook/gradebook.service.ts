import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GradebookService {
  constructor(private prisma: PrismaService) {}

  // ─── Grade Categories ─────────────────────────────────────────────────────

  async getCategories(organizationId: string) {
    return this.prisma.gradeCategory.findMany({
      where: { organizationId },
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(
    organizationId: string,
    dto: { name: string; weight: number },
  ) {
    return this.prisma.gradeCategory.create({
      data: { ...dto, organizationId },
    });
  }

  async deleteCategory(id: string) {
    return this.prisma.gradeCategory.delete({ where: { id } });
  }

  // ─── Grade Scales ─────────────────────────────────────────────────────────

  async getScales(organizationId: string) {
    return this.prisma.gradeScale.findMany({
      where: { organizationId },
      orderBy: { minScore: 'desc' },
    });
  }

  async upsertScales(
    organizationId: string,
    scales: {
      minScore: number;
      maxScore: number;
      grade: string;
      label?: string;
    }[],
  ) {
    await this.prisma.gradeScale.deleteMany({ where: { organizationId } });
    return this.prisma.gradeScale.createMany({
      data: scales.map((s) => ({ ...s, organizationId })),
    });
  }

  async seedDefaultScales(organizationId: string) {
    const defaults = [
      { minScore: 80, maxScore: 100, grade: 'A', label: 'Distinction' },
      { minScore: 70, maxScore: 79.9, grade: 'B', label: 'Credit' },
      { minScore: 60, maxScore: 69.9, grade: 'C', label: 'Merit' },
      { minScore: 50, maxScore: 59.9, grade: 'D', label: 'Pass' },
      { minScore: 0, maxScore: 49.9, grade: 'F', label: 'Fail' },
    ];
    await this.prisma.gradeScale.deleteMany({ where: { organizationId } });
    await this.prisma.gradeScale.createMany({
      data: defaults.map((d) => ({ ...d, organizationId })),
    });
    return this.getScales(organizationId);
  }

  // ─── Student Grades ───────────────────────────────────────────────────────

  async addGrade(dto: {
    studentId: string;
    courseId: string;
    categoryId: string;
    termId: string;
    score: number;
    maxScore: number;
    notes?: string;
  }) {
    return this.prisma.studentGrade.create({ data: dto });
  }

  async getGradesForCourse(courseId: string, termId: string) {
    return this.prisma.studentGrade.findMany({
      where: { courseId, termId },
      include: {
        student: { select: { id: true, firstName: true, lastName: true } },
        category: true,
      },
      orderBy: [{ student: { lastName: 'asc' } }],
    });
  }

  async getMyGrades(studentId: string) {
    return this.prisma.studentGrade.findMany({
      where: { studentId },
      include: {
        course: { select: { id: true, title: true } },
        category: true,
        term: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Course Results ───────────────────────────────────────────────────────

  async getResults(studentId: string) {
    return this.prisma.courseResult.findMany({
      where: { studentId },
      include: {
        course: { select: { id: true, title: true } },
        term: { include: { academicYear: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async computeAndSaveResult(
    studentId: string,
    courseId: string,
    termId: string,
    organizationId: string,
  ) {
    const grades = await this.prisma.studentGrade.findMany({
      where: { studentId, courseId, termId },
      include: { category: true },
    });

    if (grades.length === 0) return null;

    const weighted = grades.map((g) => ({
      pct: g.maxScore > 0 ? (g.score / g.maxScore) * 100 : 0,
      weight: g.category.weight,
    }));
    const totalWeight = weighted.reduce((a, b) => a + b.weight, 0);
    const percentage =
      totalWeight > 0
        ? weighted.reduce((a, b) => a + b.pct * (b.weight / totalWeight), 0)
        : weighted.reduce((a, b) => a + b.pct, 0) / weighted.length;

    const scale = await this.prisma.gradeScale.findFirst({
      where: {
        organizationId,
        minScore: { lte: percentage },
        maxScore: { gte: percentage },
      },
    });

    return this.prisma.courseResult.upsert({
      where: { studentId_courseId_termId: { studentId, courseId, termId } },
      update: { percentage, grade: scale?.grade },
      create: { studentId, courseId, termId, percentage, grade: scale?.grade },
    });
  }
}
