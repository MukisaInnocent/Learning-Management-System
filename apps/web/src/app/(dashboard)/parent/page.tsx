import { cookies } from 'next/headers';
import Link from 'next/link';
import { Users, BookOpen, ClipboardList, TrendingUp } from 'lucide-react';
import { Card } from '../../../components/ui/Card';

async function getChildren(token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/parents/children`, {
    headers: { Cookie: `accessToken=${token}` },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function ParentDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value || '';
  const children = await getChildren(token);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Parent Dashboard</h1>
      <p className="mb-8 text-gray-500">Monitor your children&apos;s learning progress.</p>

      <Card title="My Children">
        {children.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <Users className="h-12 w-12 text-gray-300" />
            <p className="text-gray-500">No children linked to your account yet.</p>
            <p className="text-sm text-gray-400">Contact your school administrator to link your children.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {children.map((child: any) => (
              <Link
                key={child.userId}
                href={`/parent/children/${child.userId}`}
                className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-lg">
                    {child.user?.firstName?.[0]}{child.user?.lastName?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{child.user?.firstName} {child.user?.lastName}</p>
                    <p className="text-sm text-gray-500">{child.level?.name ?? 'No level set'}</p>
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> Courses</span>
                  <span className="flex items-center gap-1"><ClipboardList className="h-4 w-4" /> Quizzes</span>
                  <span className="flex items-center gap-1"><TrendingUp className="h-4 w-4" /> Progress</span>
                </div>
                <p className="text-xs text-blue-600 font-medium">View details →</p>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
