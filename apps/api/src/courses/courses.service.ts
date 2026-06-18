import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CreateModuleDto,
  UpdateModuleDto,
  CreateLessonDto,
  UpdateLessonDto,
} from './dto/course.dto';
import { ContentStatus, Prisma, Role } from '@prisma/client';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  // ─── Courses ───────────────────────────────────────────────────────────────

  async create(dto: CreateCourseDto, userId: string, organizationId: string) {
    return this.prisma.course.create({
      data: { ...dto, createdById: userId, organizationId },
      include: {
        academicLevel: true,
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async findAll(organizationId: string, userId: string, role: Role) {
    const where: Prisma.CourseWhereInput = { organizationId };

    if (role === Role.STUDENT) {
      where.status = ContentStatus.PUBLISHED;
    } else if (role === Role.TEACHER) {
      where.OR = [{ status: ContentStatus.PUBLISHED }, { createdById: userId }];
    }

    return this.prisma.course.findMany({
      where,
      include: {
        academicLevel: true,
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { enrollments: true, modules: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        academicLevel: true,
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        modules: {
          orderBy: { order: 'asc' },
          include: { lessons: { orderBy: { order: 'asc' } } },
        },
        _count: { select: { enrollments: true } },
      },
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async update(id: string, dto: UpdateCourseDto, userId: string, role: Role) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');
    if (role === Role.TEACHER && course.createdById !== userId) {
      throw new ForbiddenException('You can only edit your own courses');
    }
    return this.prisma.course.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');
    await this.prisma.course.delete({ where: { id } });
    return { message: 'Course deleted' };
  }

  async enroll(courseId: string, userId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) throw new NotFoundException('Course not found');

    return this.prisma.courseEnrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: {},
      create: { userId, courseId },
    });
  }

  async getMyEnrollments(userId: string) {
    return this.prisma.courseEnrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            academicLevel: true,
            _count: { select: { modules: true } },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });
  }

  // ─── Modules ───────────────────────────────────────────────────────────────

  async createModule(courseId: string, dto: CreateModuleDto) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) throw new NotFoundException('Course not found');
    return this.prisma.courseModule.create({
      data: { ...dto, courseId },
      include: { lessons: true },
    });
  }

  async updateModule(moduleId: string, dto: UpdateModuleDto) {
    const mod = await this.prisma.courseModule.findUnique({
      where: { id: moduleId },
    });
    if (!mod) throw new NotFoundException('Module not found');
    return this.prisma.courseModule.update({
      where: { id: moduleId },
      data: dto,
    });
  }

  async removeModule(moduleId: string) {
    const mod = await this.prisma.courseModule.findUnique({
      where: { id: moduleId },
    });
    if (!mod) throw new NotFoundException('Module not found');
    await this.prisma.courseModule.delete({ where: { id: moduleId } });
    return { message: 'Module deleted' };
  }

  // ─── Lessons ───────────────────────────────────────────────────────────────

  async createLesson(moduleId: string, dto: CreateLessonDto) {
    const mod = await this.prisma.courseModule.findUnique({
      where: { id: moduleId },
    });
    if (!mod) throw new NotFoundException('Module not found');
    return this.prisma.lesson.create({ data: { ...dto, moduleId } });
  }

  async findLesson(lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        quizzes: { include: { questions: { include: { options: true } } } },
      },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    return lesson;
  }

  async updateLesson(lessonId: string, dto: UpdateLessonDto) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    return this.prisma.lesson.update({ where: { id: lessonId }, data: dto });
  }

  async removeLesson(lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    await this.prisma.lesson.delete({ where: { id: lessonId } });
    return { message: 'Lesson deleted' };
  }
}
