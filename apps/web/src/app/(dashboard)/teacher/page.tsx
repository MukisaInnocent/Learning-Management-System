import { cookies } from 'next/headers';
import Link from 'next/link';
import { BookOpen, Plus, Users } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

async function getCourses(token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/courses`,
    { headers: { Cookie: `accessToken=${token}` }, cache: 'no-store' },
  );
  if (!res.ok) return [];
  return res.json();
}

export default async function TeacherDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value || '';
  const courses = await getCourses(token);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-500">Manage your courses, lessons and quizzes</p>
        </div>
        <Link href="/teacher/courses/new">
          <Button size="lg">
            <Plus className="h-4 w-4" /> New Course
          </Button>
        </Link>
      </div>

      {courses.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <BookOpen className="h-16 w-16 text-gray-200" />
            <div>
              <p className="text-lg font-medium text-gray-600">No courses yet</p>
              <p className="text-sm text-gray-400">Create your first course to get started</p>
            </div>
            <Link href="/teacher/courses/new">
              <Button><Plus className="h-4 w-4" /> Create Course</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {courses.map((course: any) => (
            <Link key={course.id} href={`/teacher/courses/${course.id}/edit`}>
              <div className="rounded-xl border border-gray-200 bg-white p-5 hover:border-blue-200 hover:shadow-sm transition-all">
                <div className="mb-3 flex items-start justify-between">
                  <h3 className="font-semibold text-gray-900">{course.title}</h3>
                  <Badge color={course.status === 'PUBLISHED' ? 'green' : 'gray'}>
                    {course.status}
                  </Badge>
                </div>
                {course.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{course.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  {course.academicLevel && <Badge color="blue">{course.academicLevel.name}</Badge>}
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" /> {course._count?.modules ?? 0} modules
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" /> {course._count?.enrollments ?? 0} students
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
