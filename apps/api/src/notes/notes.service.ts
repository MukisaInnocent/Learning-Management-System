import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async findByLesson(lessonId: string, userId: string) {
    return this.prisma.note.findMany({
      where: { lessonId, userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findAll(userId: string) {
    return this.prisma.note.findMany({
      where: { userId },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            module: {
              select: { course: { select: { id: true, title: true } } },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async upsert(lessonId: string, userId: string, content: string) {
    const existing = await this.prisma.note.findFirst({
      where: { lessonId, userId },
    });
    if (existing) {
      return this.prisma.note.update({
        where: { id: existing.id },
        data: { content },
      });
    }
    return this.prisma.note.create({ data: { lessonId, userId, content } });
  }

  async remove(id: string, userId: string) {
    return this.prisma.note.deleteMany({ where: { id, userId } });
  }
}
