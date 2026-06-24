import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { AcademicModule } from './academic/academic.module';
import { CoursesModule } from './courses/courses.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { ProgressModule } from './progress/progress.module';
import { SubjectsModule } from './subjects/subjects.module';
import { StudentsModule } from './students/students.module';
import { ParentsModule } from './parents/parents.module';
import { NotesModule } from './notes/notes.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { NotificationsModule } from './notifications/notifications.module';
import { GradebookModule } from './gradebook/gradebook.module';
import { AttendanceModule } from './attendance/attendance.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { QuestionBankModule } from './question-bank/question-bank.module';
import { BillingModule } from './billing/billing.module';
import { CertificatesModule } from './certificates/certificates.module';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    AcademicModule,
    CoursesModule,
    QuizzesModule,
    ProgressModule,
    SubjectsModule,
    StudentsModule,
    ParentsModule,
    NotesModule,
    BookmarksModule,
    NotificationsModule,
    GradebookModule,
    AttendanceModule,
    AssignmentsModule,
    QuestionBankModule,
    BillingModule,
    CertificatesModule,
  ],
})
export class AppModule {}
