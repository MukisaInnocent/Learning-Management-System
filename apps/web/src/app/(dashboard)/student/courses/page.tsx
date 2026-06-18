import { cookies } from 'next/headers';
import Link from 'next/link';
import { BookOpen, Users } from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';

interface Course {
  id: string;
  title: string;
  description?: string;
  coverUrl?: string;
  status: string;
  academicLevel?: { name: string };
  _count?: { modules: number; enrollments: number };
}

async function getCourses(token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/courses`,
    { headers: { Cookie: `accessToken=${token}` }, cache: 'no-store' },
  );
  if (!res.ok) return [];
  return res.json() as Promise<Course[]>;
}

export default async function StudentCoursesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value || '';
  const courses = await getCourses(token);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Course Catalog</h1>

      {courses.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <BookOpen className="h-16 w-16 text-gray-200" />
            <p className="text-lg font-medium text-gray-500">No courses available yet</p>
            <p className="text-sm text-gray-400">Check back later or contact your teacher</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link key={course.id} href={`/student/courses/${course.id}`}>
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all overflow-hidden">
                <div className="h-36 bg-linear-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
                  {course.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={course.coverUrl} alt={course.title} className="h-full w-full object-cover" />
                  ) : (
                    <BookOpen className="h-12 w-12 text-white opacity-60" />
                  )}
                </div>
                <div className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    {course.academicLevel && (
                      <Badge color="blue">{course.academicLevel.name}</Badge>
                    )}
                    <Badge color={course.status === 'PUBLISHED' ? 'green' : 'gray'}>
                      {course.status}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                  {course.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{course.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {course._count?.modules ?? 0} modules
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {course._count?.enrollments ?? 0} students
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
