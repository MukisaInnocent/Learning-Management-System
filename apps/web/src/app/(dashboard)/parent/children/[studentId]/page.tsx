import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, CheckCircle, ClipboardList } from 'lucide-react';
import { Card } from '../../../../../components/ui/Card';
import { Badge } from '../../../../../components/ui/Badge';

async function getChildDetail(token: string, studentId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/parents/children/${studentId}`, {
    headers: { Cookie: `accessToken=${token}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function ChildDetailPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value || '';
  const child = await getChildDetail(token, studentId);
  if (!child) notFound();

  const completedLessons = child.lessonProgress?.filter((p: any) => p.completed).length ?? 0;
  const enrolledCourses = child.enrollments?.length ?? 0;
  const quizzesTaken = child.quizAttempts?.length ?? 0;

  return (
    <div>
      <Link href="/parent" className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xl">
          {child.firstName?.[0]}{child.lastName?.[0]}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{child.firstName} {child.lastName}</h1>
          <p className="text-gray-500">{child.studentProfile?.level?.name ?? 'Level not set'} · {child.email}</p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-4">
        {[
          { label: 'Enrolled Courses', value: enrolledCourses, icon: BookOpen, color: 'text-blue-600 bg-blue-50' },
          { label: 'Lessons Done', value: completedLessons, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
          { label: 'Quizzes Taken', value: quizzesTaken, icon: ClipboardList, color: 'text-purple-600 bg-purple-50' },
        ].map(({ label, value, icon: Icon, color }) => (
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Enrolled Courses">
          {child.enrollments?.length > 0 ? (
            <div className="space-y-3">
              {child.enrollments.map((e: any) => (
                <div key={e.courseId} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm font-medium text-gray-900">{e.course?.title}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-20 rounded-full bg-gray-200">
                      <div className="h-2 rounded-full bg-blue-600" style={{ width: `${e.progress ?? 0}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">{Math.round(e.progress ?? 0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No courses enrolled.</p>
          )}
        </Card>

        <Card title="Report Cards">
          {child.reportCards?.length > 0 ? (
            <div className="space-y-3">
              {child.reportCards.map((rc: any) => (
                <div key={rc.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{rc.term?.name} — {rc.term?.academicYear?.year}</span>
                    <Badge color="blue">{rc.overallScore ? `${Math.round(rc.overallScore)}%` : 'Pending'}</Badge>
                  </div>
                  {rc.position && <p className="text-sm text-gray-500 mt-1">Position: {rc.position}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No published report cards.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
