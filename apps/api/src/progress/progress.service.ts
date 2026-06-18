import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async markLessonProgress(
    lessonId: string,
    userId: string,
    watchedSeconds = 0,
  ) {
    const progress = await this.prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { watchedSeconds, completed: true, completedAt: new Date() },
      create: {
        userId,
        lessonId,
        watchedSeconds,
        completed: true,
        completedAt: new Date(),
      },
    });

    await this.recalculateCourseProgress(lessonId, userId);
    return progress;
  }

  async updateWatchProgress(
    lessonId: string,
    userId: string,
    watchedSeconds: number,
  ) {
    return this.prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { watchedSeconds },
      create: { userId, lessonId, watchedSeconds },
    });
  }

  async getLessonProgress(lessonId: string, userId: string) {
    return this.prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });
  }

  async getCourseProgress(courseId: string, userId: string) {
    const enrollment = await this.prisma.courseEnrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      include: {
        course: {
          include: {
            modules: { include: { lessons: true } },
          },
        },
      },
    });

    if (!enrollment) return null;

    const allLessonIds = enrollment.course.modules.flatMap((m) =>
      m.lessons.map((l) => l.id),
    );
    const completedLessons = await this.prisma.lessonProgress.count({
      where: { userId, lessonId: { in: allLessonIds }, completed: true },
    });

    const progress =
      allLessonIds.length > 0
        ? (completedLessons / allLessonIds.length) * 100
        : 0;

    return {
      courseId,
      totalLessons: allLessonIds.length,
      completedLessons,
      progress,
      enrollment,
    };
  }

  async getDashboard(userId: string) {
    const enrollments = await this.prisma.courseEnrollment.findMany({
      where: { userId },
      include: { course: { select: { id: true, title: true } } },
    });

    const quizAttempts = await this.prisma.quizAttempt.count({
      where: { userId },
    });
    const completedAttempts = await this.prisma.quizAttempt.count({
      where: { userId, status: 'COMPLETED' },
    });

    const completedLessons = await this.prisma.lessonProgress.count({
      where: { userId, completed: true },
    });

    return {
      enrolledCourses: enrollments.length,
      completedLessons,
      quizAttempts,
      completedQuizzes: completedAttempts,
      enrollments,
    };
  }

  private async recalculateCourseProgress(lessonId: string, userId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: { include: { modules: { include: { lessons: true } } } },
          },
        },
      },
    });
    if (!lesson) return;

    const course = lesson.module.course;
    const allLessonIds = course.modules.flatMap((m) =>
      m.lessons.map((l) => l.id),
    );
    const completedCount = await this.prisma.lessonProgress.count({
      where: { userId, lessonId: { in: allLessonIds }, completed: true },
    });

    const progress =
      allLessonIds.length > 0
        ? (completedCount / allLessonIds.length) * 100
        : 0;

    await this.prisma.courseEnrollment.updateMany({
      where: { userId, courseId: course.id },
      data: { progress, completedAt: progress >= 100 ? new Date() : null },
    });
  }
}
