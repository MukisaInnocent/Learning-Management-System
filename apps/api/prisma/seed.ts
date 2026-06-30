/**
 * Demo/test data for local + LAN testing.
 * Safe to re-run — every entity is upserted by its unique key.
 *
 * Run with: node_modules/.bin/ts-node --transpile-only prisma/seed.ts
 */
import { PrismaClient, Role, ContentStatus, LessonType, QuestionType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'Passw0rd!';

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // ─── Organization ───────────────────────────────────────────────────────
  const org = await prisma.organization.upsert({
    where: { slug: 'demo-school' },
    update: {},
    create: {
      name: 'EduPlatform Demo School',
      slug: 'demo-school',
      description: 'Seeded demo organization for local/LAN testing.',
    },
  });

  // ─── Academic structure ─────────────────────────────────────────────────
  const levelP5 = await prisma.academicLevel.upsert({
    where: { code: 'P5' },
    update: {},
    create: { name: 'Primary 5', code: 'P5', order: 5 },
  });

  const year = await prisma.academicYear.upsert({
    where: { organizationId_year: { organizationId: org.id, year: 2026 } },
    update: {},
    create: {
      organizationId: org.id,
      year: 2026,
      isCurrent: true,
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-11-30'),
    },
  });

  const term1 = await prisma.term.upsert({
    where: { academicYearId_number: { academicYearId: year.id, number: 1 } },
    update: {},
    create: {
      name: 'Term 1',
      number: 1,
      academicYearId: year.id,
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-04-30'),
    },
  });

  const subjectMath = await prisma.subject.upsert({
    where: { organizationId_code: { organizationId: org.id, code: 'MATH' } },
    update: {},
    create: { organizationId: org.id, name: 'Mathematics', code: 'MATH' },
  });

  // ─── Users (one per role) ───────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@eduplatform.test' },
    update: { passwordHash },
    create: {
      email: 'admin@eduplatform.test',
      firstName: 'Aida',
      lastName: 'Admin',
      passwordHash,
      role: Role.ORG_ADMIN,
      organizationId: org.id,
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@eduplatform.test' },
    update: { passwordHash },
    create: {
      email: 'teacher@eduplatform.test',
      firstName: 'Tom',
      lastName: 'Teacher',
      passwordHash,
      role: Role.TEACHER,
      organizationId: org.id,
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@eduplatform.test' },
    update: { passwordHash },
    create: {
      email: 'student@eduplatform.test',
      firstName: 'Sam',
      lastName: 'Student',
      passwordHash,
      role: Role.STUDENT,
      organizationId: org.id,
    },
  });

  const parent = await prisma.user.upsert({
    where: { email: 'parent@eduplatform.test' },
    update: { passwordHash },
    create: {
      email: 'parent@eduplatform.test',
      firstName: 'Pat',
      lastName: 'Parent',
      passwordHash,
      role: Role.PARENT,
      organizationId: org.id,
    },
  });

  for (const u of [admin, teacher, student, parent]) {
    await prisma.organizationMember.upsert({
      where: { userId_organizationId: { userId: u.id, organizationId: org.id } },
      update: {},
      create: { userId: u.id, organizationId: org.id, role: u.role },
    });
  }

  const studentProfile = await prisma.studentProfile.upsert({
    where: { userId: student.id },
    update: {},
    create: {
      userId: student.id,
      levelId: levelP5.id,
      admissionNo: 'DEMO-0001',
      gender: 'F',
    },
  });

  const parentProfile = await prisma.parentProfile.upsert({
    where: { userId: parent.id },
    update: {},
    create: { userId: parent.id, occupation: 'Engineer' },
  });

  await prisma.studentParent.upsert({
    where: {
      studentProfileId_parentProfileId: {
        studentProfileId: studentProfile.id,
        parentProfileId: parentProfile.id,
      },
    },
    update: {},
    create: {
      studentProfileId: studentProfile.id,
      parentProfileId: parentProfile.id,
      relationship: 'Parent',
    },
  });

  // ─── Course + content ───────────────────────────────────────────────────
  let course = await prisma.course.findFirst({
    where: { organizationId: org.id, title: 'Introduction to Mathematics' },
  });
  if (!course) {
    course = await prisma.course.create({
      data: {
        title: 'Introduction to Mathematics',
        description: 'A starter course covering basic numeracy.',
        status: ContentStatus.PUBLISHED,
        organizationId: org.id,
        academicLevelId: levelP5.id,
        subjectId: subjectMath.id,
        createdById: teacher.id,
      },
    });
  }

  const moduleOne = await prisma.courseModule.upsert({
    where: { courseId_order: { courseId: course.id, order: 1 } },
    update: {},
    create: {
      title: 'Numbers and Counting',
      description: 'Foundations of numeracy.',
      order: 1,
      courseId: course.id,
    },
  });

  const lessonOne = await prisma.lesson.upsert({
    where: { moduleId_order: { moduleId: moduleOne.id, order: 1 } },
    update: {},
    create: {
      title: 'What Are Numbers?',
      type: LessonType.TEXT,
      order: 1,
      moduleId: moduleOne.id,
      content: 'Numbers are symbols used to represent quantity...',
      isPreview: true,
    },
  });

  await prisma.lesson.upsert({
    where: { moduleId_order: { moduleId: moduleOne.id, order: 2 } },
    update: {},
    create: {
      title: 'Counting Practice',
      type: LessonType.VIDEO,
      order: 2,
      moduleId: moduleOne.id,
      durationMinutes: 8,
      videoUrl: 'https://example.com/demo-video.mp4',
    },
  });

  await prisma.courseEnrollment.upsert({
    where: { userId_courseId: { userId: student.id, courseId: course.id } },
    update: {},
    create: { userId: student.id, courseId: course.id, progress: 50 },
  });

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: student.id, lessonId: lessonOne.id } },
    update: { completed: true, completedAt: new Date() },
    create: {
      userId: student.id,
      lessonId: lessonOne.id,
      completed: true,
      completedAt: new Date(),
      watchedSeconds: 120,
    },
  });

  // ─── Quiz ────────────────────────────────────────────────────────────────
  let quiz = await prisma.quiz.findFirst({ where: { courseId: course.id, title: 'Numbers Quiz' } });
  if (!quiz) {
    quiz = await prisma.quiz.create({
      data: {
        title: 'Numbers Quiz',
        description: 'Quick check on basic numbers.',
        courseId: course.id,
        passingScore: 70,
        maxAttempts: 3,
      },
    });
  }

  const question = await prisma.question.upsert({
    where: { quizId_order: { quizId: quiz.id, order: 1 } },
    update: {},
    create: {
      quizId: quiz.id,
      text: 'What is 2 + 2?',
      type: QuestionType.MULTIPLE_CHOICE,
      points: 1,
      order: 1,
    },
  });

  const options: Array<[string, boolean]> = [
    ['3', false],
    ['4', true],
    ['5', false],
    ['22', false],
  ];
  for (let i = 0; i < options.length; i++) {
    const [text, isCorrect] = options[i];
    await prisma.questionOption.upsert({
      where: { questionId_order: { questionId: question.id, order: i + 1 } },
      update: {},
      create: { questionId: question.id, text, isCorrect, order: i + 1 },
    });
  }

  // ─── Gradebook + ranking defaults ───────────────────────────────────────
  const existingCategory = await prisma.gradeCategory.findFirst({
    where: { organizationId: org.id, name: 'Tests' },
  });
  if (!existingCategory) {
    await prisma.gradeCategory.create({
      data: { organizationId: org.id, name: 'Tests', weight: 40 },
    });
    await prisma.gradeCategory.create({
      data: { organizationId: org.id, name: 'Exams', weight: 60 },
    });
  }

  await prisma.rankingSetting.upsert({
    where: { organizationId: org.id },
    update: {},
    create: { organizationId: org.id, enabled: true },
  });

  // ─── Welcome notification ────────────────────────────────────────────────
  const existingNotification = await prisma.notification.findFirst({
    where: { userId: student.id, title: 'Welcome to EduPlatform' },
  });
  if (!existingNotification) {
    await prisma.notification.create({
      data: {
        userId: student.id,
        title: 'Welcome to EduPlatform',
        message: 'Your demo account is ready. Start with "Introduction to Mathematics".',
        type: 'info',
      },
    });
  }

  void term1; // reserved for future term-scoped seed data

  console.log('\nSeed complete. Demo login credentials (all use the same password):\n');
  console.log(`  Password: ${DEMO_PASSWORD}\n`);
  console.log('  Role        Email');
  console.log('  ----------  --------------------------');
  console.log(`  Org Admin   ${admin.email}`);
  console.log(`  Teacher     ${teacher.email}`);
  console.log(`  Student     ${student.email}`);
  console.log(`  Parent      ${parent.email}`);
  console.log(`\n  Organization: ${org.name} (${org.slug})\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
