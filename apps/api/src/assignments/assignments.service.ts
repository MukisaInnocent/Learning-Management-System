import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssignmentsService {
  constructor(private prisma: PrismaService) {}

  async findByCourse(courseId: string) {
    return this.prisma.assignment.findMany({
      where: { courseId },
      include: {
        createdBy: { select: { firstName: true, lastName: true } },
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPublished(courseId: string) {
    return this.prisma.assignment.findMany({
      where: { courseId, status: ContentStatus.PUBLISHED },
      orderBy: { dueDate: 'asc' },
    });
  }

  async findOne(id: string) {
    const a = await this.prisma.assignment.findUnique({
      where: { id },
      include: { createdBy: { select: { firstName: true, lastName: true } } },
    });
    if (!a) throw new NotFoundException('Assignment not found');
    return a;
  }

  async create(
    courseId: string,
    createdById: string,
    dto: {
      title: string;
      instructions?: string;
      dueDate?: string;
      totalMarks?: number;
    },
  ) {
    return this.prisma.assignment.create({
      data: {
        courseId,
        createdById,
        title: dto.title,
        instructions: dto.instructions,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        totalMarks: dto.totalMarks ?? 100,
      },
    });
  }

  async publish(id: string) {
    return this.prisma.assignment.update({
      where: { id },
      data: { status: ContentStatus.PUBLISHED },
    });
  }

  async remove(id: string) {
    return this.prisma.assignment.delete({ where: { id } });
  }

  async submit(
    assignmentId: string,
    studentId: string,
    dto: { answerText?: string; fileUrl?: string },
  ) {
    return this.prisma.assignmentSubmission.upsert({
      where: { assignmentId_studentId: { assignmentId, studentId } },
      update: {
        answerText: dto.answerText,
        fileUrl: dto.fileUrl,
        submittedAt: new Date(),
      },
      create: {
        assignmentId,
        studentId,
        answerText: dto.answerText,
        fileUrl: dto.fileUrl,
      },
    });
  }

  async getSubmissions(assignmentId: string) {
    return this.prisma.assignmentSubmission.findMany({
      where: { assignmentId },
      include: {
        student: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { submittedAt: 'asc' },
    });
  }

  async gradeSubmission(
    submissionId: string,
    marks: number,
    feedback?: string,
  ) {
    return this.prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: { marks, feedback, gradedAt: new Date() },
    });
  }

  async getMySubmissions(studentId: string) {
    return this.prisma.assignmentSubmission.findMany({
      where: { studentId },
      include: {
        assignment: {
          include: { course: { select: { id: true, title: true } } },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }
}
