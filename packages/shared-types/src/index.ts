// ─── Enums ───────────────────────────────────────────────────────────────────

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ORG_ADMIN = 'ORG_ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
}

export enum ContentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum LessonType {
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  TEXT = 'TEXT',
  LINK = 'LINK',
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER',
}

export enum AttemptStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
}

// ─── User Types ───────────────────────────────────────────────────────────────

export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  organizationId: string;
  createdAt: string;
}

export interface IUserPublic extends IUser {
  organization?: IOrganization;
}

// ─── Organization Types ───────────────────────────────────────────────────────

export interface IOrganization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  createdAt: string;
}

export interface IOrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: Role;
  joinedAt: string;
  user?: IUser;
}

// ─── Academic Types ───────────────────────────────────────────────────────────

export interface IAcademicLevel {
  id: string;
  name: string;
  code: string;
  order: number;
  description?: string;
}

export interface IAcademicYear {
  id: string;
  year: number;
  organizationId: string;
  isCurrent: boolean;
  startDate: string;
  endDate: string;
}

export interface ITerm {
  id: string;
  name: string;
  number: number;
  academicYearId: string;
  startDate: string;
  endDate: string;
}

// ─── Course Types ─────────────────────────────────────────────────────────────

export interface ICourse {
  id: string;
  title: string;
  description?: string;
  coverUrl?: string;
  status: ContentStatus;
  organizationId: string;
  academicLevelId?: string;
  createdById: string;
  createdAt: string;
  modules?: ICourseModule[];
  academicLevel?: IAcademicLevel;
  createdBy?: IUser;
  _count?: { enrollments: number };
}

export interface ICourseModule {
  id: string;
  title: string;
  description?: string;
  order: number;
  courseId: string;
  lessons?: ILesson[];
}

export interface ILesson {
  id: string;
  title: string;
  description?: string;
  type: LessonType;
  order: number;
  moduleId: string;
  durationMinutes?: number;
  videoUrl?: string;
  documentUrl?: string;
  content?: string;
  externalUrl?: string;
  isPreview: boolean;
  quizzes?: IQuiz[];
}

export interface ICourseEnrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  completedAt?: string;
  progress: number;
  course?: ICourse;
}

// ─── Assessment Types ─────────────────────────────────────────────────────────

export interface IQuiz {
  id: string;
  title: string;
  description?: string;
  lessonId?: string;
  courseId?: string;
  timeLimit?: number;
  passingScore: number;
  maxAttempts: number;
  questions?: IQuestion[];
}

export interface IQuestion {
  id: string;
  quizId: string;
  text: string;
  type: QuestionType;
  points: number;
  order: number;
  explanation?: string;
  options?: IQuestionOption[];
}

export interface IQuestionOption {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface IQuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  status: AttemptStatus;
  score?: number;
  startedAt: string;
  completedAt?: string;
  answers?: IAttemptAnswer[];
}

export interface IAttemptAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  selectedOptionId?: string;
  textAnswer?: string;
  isCorrect?: boolean;
  pointsEarned: number;
}

// ─── Progress Types ───────────────────────────────────────────────────────────

export interface ILessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  completed: boolean;
  watchedSeconds: number;
  completedAt?: string;
}

// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthResponse {
  user: IUserPublic;
  tokens: IAuthTokens;
}

export interface IJwtPayload {
  sub: string;
  email: string;
  role: Role;
  organizationId: string;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface IApiResponse<T> {
  data: T;
  message?: string;
}

export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
