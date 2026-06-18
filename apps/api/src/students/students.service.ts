import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.user.findMany({
      where: { organizationId, role: 'STUDENT' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatarUrl: true,
        studentProfile: { include: { level: true } },
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
  }

  async findOne(id: string) {
    const student = await this.prisma.user.findFirst({
      where: { id, role: 'STUDENT' },
      include: {
        studentProfile: {
          include: {
            level: true,
            parents: {
              include: {
                parentProfile: {
                  include: {
                    user: {
                      select: { firstName: true, lastName: true, email: true },
                    },
                  },
                },
              },
            },
          },
        },
        enrollments: {
          include: { course: { select: { id: true, title: true } } },
        },
      },
    });
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  async upsertProfile(
    userId: string,
    dto: {
      dateOfBirth?: string;
      gender?: string;
      address?: string;
      phone?: string;
      admissionNo?: string;
      levelId?: string;
    },
  ) {
    const profileData = {
      gender: dto.gender,
      address: dto.address,
      phone: dto.phone,
      admissionNo: dto.admissionNo,
      levelId: dto.levelId,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
    };
    return this.prisma.studentProfile.upsert({
      where: { userId },
      update: profileData,
      create: { userId, ...profileData },
      include: { level: true },
    });
  }

  async linkParent(
    studentUserId: string,
    parentUserId: string,
    relationship = 'Parent',
  ) {
    const studentProfile = await this.prisma.studentProfile.upsert({
      where: { userId: studentUserId },
      update: {},
      create: { userId: studentUserId },
    });
    const parentProfile = await this.prisma.parentProfile.upsert({
      where: { userId: parentUserId },
      update: {},
      create: { userId: parentUserId },
    });
    return this.prisma.studentParent.upsert({
      where: {
        studentProfileId_parentProfileId: {
          studentProfileId: studentProfile.id,
          parentProfileId: parentProfile.id,
        },
      },
      update: { relationship },
      create: {
        studentProfileId: studentProfile.id,
        parentProfileId: parentProfile.id,
        relationship,
      },
    });
  }
}
