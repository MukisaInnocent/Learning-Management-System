import { Injectable } from '@nestjs/common';
import { AttendanceStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async markAttendance(
    records: {
      studentId: string;
      termId: string;
      date: string;
      status: AttendanceStatus;
      notes?: string;
    }[],
  ) {
    const results: Awaited<ReturnType<typeof this.prisma.attendance.upsert>>[] =
      [];
    for (const r of records) {
      const date = new Date(r.date);
      const result = await this.prisma.attendance.upsert({
        where: { studentId_date: { studentId: r.studentId, date } },
        update: { status: r.status, notes: r.notes },
        create: {
          studentId: r.studentId,
          termId: r.termId,
          date,
          status: r.status,
          notes: r.notes,
        },
      });
      results.push(result);
    }
    return results;
  }

  async getStudentAttendance(studentId: string, termId?: string) {
    return this.prisma.attendance.findMany({
      where: { studentId, ...(termId ? { termId } : {}) },
      include: { term: true },
      orderBy: { date: 'desc' },
    });
  }

  async getAttendanceForDate(
    organizationId: string,
    date: string,
    termId: string,
  ) {
    const d = new Date(date);
    const students = await this.prisma.user.findMany({
      where: { organizationId, role: 'STUDENT' },
      select: { id: true, firstName: true, lastName: true },
    });

    const records = await this.prisma.attendance.findMany({
      where: { date: d, termId },
    });

    return students.map((s) => ({
      ...s,
      attendance: records.find((r) => r.studentId === s.id) || null,
    }));
  }

  async getSummary(studentId: string, termId: string) {
    const records = await this.prisma.attendance.findMany({
      where: { studentId, termId },
    });
    const total = records.length;
    const present = records.filter((r) => r.status === 'PRESENT').length;
    const absent = records.filter((r) => r.status === 'ABSENT').length;
    const late = records.filter((r) => r.status === 'LATE').length;
    return {
      total,
      present,
      absent,
      late,
      rate: total > 0 ? Math.round((present / total) * 100) : 0,
    };
  }
}
