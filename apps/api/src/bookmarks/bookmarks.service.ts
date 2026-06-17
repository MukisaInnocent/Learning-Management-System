import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarksService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.bookmark.findMany({
      where: { userId },
      include: {
        lesson: {
          select: {
            id: true, title: true, type: true,
            module: { select: { course: { select: { id: true, title: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async toggle(lessonId: string, userId: string) {
    const existing = await this.prisma.bookmark.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });
    if (existing) {
      await this.prisma.bookmark.delete({ where: { id: existing.id } });
      return { bookmarked: false };
    }
    await this.prisma.bookmark.create({ data: { userId, lessonId } });
    return { bookmarked: true };
  }

  async isBookmarked(lessonId: string, userId: string) {
    const b = await this.prisma.bookmark.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });
    return { bookmarked: !!b };
  }
}
