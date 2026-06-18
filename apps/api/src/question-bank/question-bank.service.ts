import { Injectable, NotFoundException } from '@nestjs/common';
import { Difficulty, QuestionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuestionBankService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    organizationId: string,
    filters?: {
      subjectId?: string;
      levelId?: string;
      difficulty?: Difficulty;
      type?: QuestionType;
    },
  ) {
    return this.prisma.questionBank.findMany({
      where: { organizationId, ...filters },
      include: {
        options: { orderBy: { order: 'asc' } },
        subject: true,
        level: true,
        createdBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const q = await this.prisma.questionBank.findUnique({
      where: { id },
      include: {
        options: { orderBy: { order: 'asc' } },
        subject: true,
        level: true,
      },
    });
    if (!q) throw new NotFoundException('Question not found');
    return q;
  }

  async create(
    organizationId: string,
    createdById: string,
    dto: {
      text: string;
      type?: QuestionType;
      difficulty?: Difficulty;
      topic?: string;
      explanation?: string;
      marks?: number;
      subjectId?: string;
      levelId?: string;
      options?: { text: string; isCorrect: boolean }[];
    },
  ) {
    return this.prisma.questionBank.create({
      data: {
        organizationId,
        createdById,
        text: dto.text,
        type: dto.type ?? QuestionType.MULTIPLE_CHOICE,
        difficulty: dto.difficulty ?? Difficulty.MEDIUM,
        topic: dto.topic,
        explanation: dto.explanation,
        marks: dto.marks ?? 1,
        subjectId: dto.subjectId,
        levelId: dto.levelId,
        options: dto.options
          ? { create: dto.options.map((o, i) => ({ ...o, order: i + 1 })) }
          : undefined,
      },
      include: { options: true },
    });
  }

  async remove(id: string) {
    return this.prisma.questionBank.delete({ where: { id } });
  }
}
