import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto, SubmitAttemptDto } from './dto/quiz.dto';
import { AttemptStatus, QuestionType } from '@prisma/client';

@Injectable()
export class QuizzesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateQuizDto) {
    const { questions, ...quizData } = dto;

    const quiz = await this.prisma.quiz.create({
      data: {
        ...quizData,
        questions: questions
          ? {
              create: questions.map((q) => ({
                text: q.text,
                type: q.type,
                points: q.points ?? 1,
                order: q.order,
                explanation: q.explanation,
                options: { create: q.options },
              })),
            }
          : undefined,
      },
      include: { questions: { include: { options: true } } },
    });

    return quiz;
  }

  async findOne(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: { options: { orderBy: { order: 'asc' } } },
        },
      },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');
    return quiz;
  }

  async findForStudent(id: string) {
    const quiz = await this.findOne(id);
    return {
      ...quiz,
      questions: quiz.questions.map((q) => ({
        ...q,
        options: q.options.map(({ isCorrect: _, ...opt }) => opt),
        explanation: undefined,
      })),
    };
  }

  async startAttempt(quizId: string, userId: string) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) throw new NotFoundException('Quiz not found');

    const attemptsCount = await this.prisma.quizAttempt.count({
      where: { quizId, userId, status: AttemptStatus.COMPLETED },
    });

    if (attemptsCount >= quiz.maxAttempts) {
      throw new BadRequestException(`Maximum ${quiz.maxAttempts} attempts reached`);
    }

    const existing = await this.prisma.quizAttempt.findFirst({
      where: { quizId, userId, status: AttemptStatus.IN_PROGRESS },
    });
    if (existing) return existing;

    return this.prisma.quizAttempt.create({
      data: { quizId, userId, status: AttemptStatus.IN_PROGRESS },
    });
  }

  async submitAttempt(attemptId: string, userId: string, dto: SubmitAttemptDto) {
    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: { quiz: { include: { questions: { include: { options: true } } } } },
    });

    if (!attempt || attempt.userId !== userId) throw new NotFoundException('Attempt not found');
    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      throw new BadRequestException('Attempt already completed');
    }

    let totalPoints = 0;
    let earnedPoints = 0;

    const answerData = dto.answers.map((answer) => {
      const question = attempt.quiz.questions.find((q) => q.id === answer.questionId);
      if (!question) return null;

      totalPoints += question.points;
      let isCorrect = false;
      let pointsEarned = 0;

      if (question.type === QuestionType.MULTIPLE_CHOICE || question.type === QuestionType.TRUE_FALSE) {
        const selectedOption = question.options.find((o) => o.id === answer.selectedOptionId);
        isCorrect = selectedOption?.isCorrect ?? false;
        pointsEarned = isCorrect ? question.points : 0;
      } else if (question.type === QuestionType.SHORT_ANSWER) {
        isCorrect = false;
        pointsEarned = 0;
      }

      earnedPoints += pointsEarned;

      return {
        attemptId,
        questionId: answer.questionId,
        selectedOptionId: answer.selectedOptionId,
        textAnswer: answer.textAnswer,
        isCorrect,
        pointsEarned,
      };
    }).filter(Boolean);

    await this.prisma.attemptAnswer.createMany({ data: answerData as any[] });

    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

    return this.prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        status: AttemptStatus.COMPLETED,
        score,
        completedAt: new Date(),
      },
      include: { answers: true },
    });
  }

  async getMyAttempts(quizId: string, userId: string) {
    return this.prisma.quizAttempt.findMany({
      where: { quizId, userId },
      include: { answers: true },
      orderBy: { startedAt: 'desc' },
    });
  }
}
