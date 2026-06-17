import { cookies } from 'next/headers';
import Link from 'next/link';
import { BookOpen, CheckCircle, ClipboardList, TrendingUp } from 'lucide-react';
import { Card } from '../../../components/ui/Card';

async function getDashboard(token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/progress/dashboard`,
    { headers: { Cookie: `accessToken=${token}` }, cache: 'no-store' },
  );
  if (!res.ok) return null;
  return res.json();
}

export default async function StudentDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value || '';
  const data = await getDashboard(token);

  const stats = [
    { label: 'Enrolled Courses', value: data?.enrolledCourses ?? 0, icon: BookOpen, color: 'text-blue-600 bg-blue-50' },
    { label: 'Lessons Completed', value: data?.completedLessons ?? 0, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
    { label: 'Quizzes Taken', value: data?.quizAttempts ?? 0, icon: ClipboardList, color: 'text-purple-600 bg-purple-50' },
    { label: 'Quizzes Passed', value: data?.completedQuizzes ?? 0, icon: TrendingUp, color: 'text-orange-600 bg-orange-50' },
  ];

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Welcome back!</h1>
      <p className="mb-8 text-gray-500">Here&apos;s your learning progress at a glance.</p>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card title="Continue Learning">
        {data?.enrollments?.length > 0 ? (
          <div className="space-y-3">
            {data.enrollments.slice(0, 5).map((e: any) => (
              <Link
                key={e.courseId}
                href={`/student/courses/${e.courseId}`}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-4 hover:border-blue-200 hover:bg-blue-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">{e.course?.title}</p>
                  <p className="text-sm text-gray-500">{Math.round(e.progress ?? 0)}% complete</p>
                </div>
                <div className="h-2 w-24 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-blue-600"
                    style={{ width: `${e.progress ?? 0}%` }}
                  />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <BookOpen className="h-12 w-12 text-gray-300" />
            <p className="text-gray-500">You haven&apos;t enrolled in any courses yet.</p>
            <Link
              href="/student/courses"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Browse courses →
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
