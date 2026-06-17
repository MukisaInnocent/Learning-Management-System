import { cookies } from 'next/headers';
import Link from 'next/link';
import { PenTool, Clock, Users } from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';

async function fetchApi(path: string, token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}${path}`,
    { headers: { Cookie: `accessToken=${token}` }, cache: 'no-store' },
  );
  if (!res.ok) return null;
  return res.json();
}

export default async function TeacherAssignmentsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value || '';

  const courses = await fetchApi('/courses', token) ?? [];
  const allAssignments = (
    await Promise.all(courses.map((c: any) => fetchApi(`/assignments/courses/${c.id}`, token).then(r => r ?? [])))
  ).flat();

  const published = allAssignments.filter((a: any) => a.published);
  const drafts = allAssignments.filter((a: any) => !a.published);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
        <p className="text-gray-500">Manage assignments across your courses</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title={`Published (${published.length})`}>
          {published.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No published assignments.</p>
          ) : (
            <div className="space-y-3">
              {published.map((a: any) => <AssignmentRow key={a.id} a={a} />)}
            </div>
          )}
        </Card>

        <Card title={`Drafts (${drafts.length})`}>
          {drafts.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No draft assignments.</p>
          ) : (
            <div className="space-y-3">
              {drafts.map((a: any) => <AssignmentRow key={a.id} a={a} isDraft />)}
            </div>
          )}
        </Card>
      </div>

      {allAssignments.length === 0 && courses.length === 0 && (
        <Card>
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <PenTool className="h-12 w-12 text-gray-300" />
            <p className="text-gray-500">No courses or assignments yet.</p>
            <Link href="/teacher/courses/new" className="text-sm font-medium text-blue-600 hover:underline">
              Create a course →
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}

function AssignmentRow({ a, isDraft }: { a: any; isDraft?: boolean }) {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{a.title}</p>
          <p className="text-xs text-gray-400">{a.course?.title}</p>
        </div>
        <Badge color={isDraft ? 'yellow' : 'green'}>{isDraft ? 'Draft' : 'Published'}</Badge>
      </div>
      <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
        {a.dueDate && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> Due {new Date(a.dueDate).toLocaleDateString()}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Users className="h-3 w-3" /> {a._count?.submissions ?? 0} submissions
        </span>
        {a.maxScore && <span>{a.maxScore} pts</span>}
      </div>
    </div>
  );
}
