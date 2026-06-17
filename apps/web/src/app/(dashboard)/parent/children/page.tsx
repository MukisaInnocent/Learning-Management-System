import { cookies } from 'next/headers';
import Link from 'next/link';
import { Users2, BookOpen, TrendingUp, ArrowRight } from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';

async function getChildren(token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/parents/children`,
    { headers: { Cookie: `accessToken=${token}` }, cache: 'no-store' },
  );
  if (!res.ok) return [];
  return res.json();
}

export default async function ParentChildrenPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value || '';
  const children = await getChildren(token);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Children</h1>
        <p className="text-gray-500">Select a child to view their detailed progress</p>
      </div>

      {children.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Users2 className="h-12 w-12 text-gray-300" />
            <p className="text-gray-700 font-medium">No children linked yet</p>
            <p className="text-sm text-gray-400">Contact your school administrator to link your children to this account.</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {children.map((child: any) => {
            const completedLessons = child.lessonProgress?.filter((p: any) => p.completed).length ?? 0;
            const enrolledCourses = child.enrollments?.length ?? 0;
            const avgProgress = enrolledCourses > 0
              ? Math.round(child.enrollments.reduce((s: number, e: any) => s + (e.progress ?? 0), 0) / enrolledCourses)
              : 0;

            return (
              <Link
                key={child.userId}
                href={`/parent/children/${child.userId}`}
                className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xl">
                    {child.user?.firstName?.[0]}{child.user?.lastName?.[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {child.user?.firstName} {child.user?.lastName}
                    </p>
                    <Badge color="blue">{child.level?.name ?? 'No level set'}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-2">
                    <BookOpen className="h-4 w-4 text-blue-500 shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">{enrolledCourses}</p>
                      <p className="text-xs text-gray-500">Courses</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-2">
                    <TrendingUp className="h-4 w-4 text-green-500 shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">{avgProgress}%</p>
                      <p className="text-xs text-gray-500">Avg Progress</p>
                    </div>
                  </div>
                </div>

                {enrolledCourses > 0 && (
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-gray-500">
                      <span>Overall progress</span>
                      <span>{avgProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-200">
                      <div
                        className="h-1.5 rounded-full bg-blue-600 transition-all"
                        style={{ width: `${avgProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end text-xs font-medium text-blue-600">
                  View details <ArrowRight className="ml-1 h-3 w-3" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
