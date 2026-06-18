import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ParentsService {
  constructor(private prisma: PrismaService) {}

  async getMyChildren(parentUserId: string) {
    const profile = await this.prisma.parentProfile.findUnique({
      where: { userId: parentUserId },
      include: {
        children: {
          include: {
            studentProfile: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    avatarUrl: true,
                  },
                },
                level: true,
              },
            },
          },
        },
      },
    });
    if (!profile) return [];
    return profile.children.map((c) => ({
      ...c.studentProfile,
      relationship: c.relationship,
    }));
  }

  async getChildDetail(parentUserId: string, studentUserId: string) {
    const parentProfile = await this.prisma.parentProfile.findUnique({
      where: { userId: parentUserId },
    });
    if (!parentProfile) throw new NotFoundException('Parent profile not found');

    const student = await this.prisma.user.findFirst({
      where: { id: studentUserId, role: 'STUDENT' },
      include: {
        studentProfile: { include: { level: true } },
        enrollments: {
          include: {
            course: { select: { id: true, title: true, academicLevel: true } },
          },
        },
        quizAttempts: {
          where: { status: 'COMPLETED' },
          orderBy: { completedAt: 'desc' },
          take: 10,
        },
        lessonProgress: { where: { completed: true } },
      },
    });
    if (!student) throw new NotFoundException('Student not found');

    const reportCards = await this.prisma.reportCard.findMany({
      where: { studentId: studentUserId, published: true },
      include: {
        term: { include: { academicYear: true } },
        remarks: {
          include: { teacher: { select: { firstName: true, lastName: true } } },
        },
      },
      orderBy: { generatedAt: 'desc' },
    });

    return { ...student, reportCards };
  }

  async upsertProfile(
    userId: string,
    dto: { phone?: string; address?: string; occupation?: string },
  ) {
    return this.prisma.parentProfile.upsert({
      where: { userId },
      update: dto,
      create: { userId, ...dto },
    });
  }
}
