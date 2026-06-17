import { cookies } from 'next/headers';
import { ClipboardList, Clock, CheckCircle } from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';

async function getEnrollments(token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/progress/dashboard`,
    { headers: { Cookie: `accessToken=${token}` }, cache: 'no-store' },
  );
  if (!res.ok) return null;
  return res.json();
}

async function getAssignments(token: string, courseId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/assignments/courses/${courseId}`,
    { headers: { Cookie: `accessToken=${token}` }, cache: 'no-store' },
  );
  if (!res.ok) return [];
  return res.json();
}

export default async function StudentAssignmentsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value || '';
  const dashboard = await getEnrollments(token);
  const enrollments = dashboard?.enrollments ?? [];

  const allAssignments = (
    await Promise.all(enrollments.map((e: any) => getAssignments(token, e.courseId)))
  ).flat();

  const now = new Date();
  const upcoming = allAssignments.filter((a: any) => a.published && (!a.dueDate || new Date(a.dueDate) > now));
  const past = allAssignments.filter((a: any) => a.published && a.dueDate && new Date(a.dueDate) <= now);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Assignments</h1>
      <p className="mb-8 text-gray-500">Track your assignments across all enrolled courses</p>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title={`Upcoming (${upcoming.length})`}>
          {upcoming.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <CheckCircle className="h-10 w-10 text-green-300" />
              <p className="text-gray-500">No upcoming assignments. All clear!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((a: any) => (
                <AssignmentCard key={a.id} assignment={a} />
              ))}
            </div>
          )}
        </Card>

        <Card title={`Past Due (${past.length})`}>
          {past.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">No past assignments.</p>
          ) : (
            <div className="space-y-3">
              {past.map((a: any) => (
                <AssignmentCard key={a.id} assignment={a} isPast />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function AssignmentCard({ assignment: a, isPast }: { assignment: any; isPast?: boolean }) {
  const mySubmission = a.submissions?.[0];
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{a.title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{a.course?.title}</p>
          {a.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{a.description}</p>}
        </div>
        <div className="shrink-0">
          {mySubmission ? (
            <Badge color="green">Submitted</Badge>
          ) : isPast ? (
            <Badge color="red">Overdue</Badge>
          ) : (
            <Badge color="yellow">Pending</Badge>
          )}
        </div>
      </div>
      {a.dueDate && (
        <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
          <Clock className="h-3 w-3" />
          Due: {new Date(a.dueDate).toLocaleDateString()}
          {a.maxScore && <span className="ml-2">· Max: {a.maxScore} pts</span>}
        </div>
      )}
      {mySubmission?.score != null && (
        <p className="mt-1 text-xs text-green-600">Score: {mySubmission.score}{a.maxScore ? `/${a.maxScore}` : ''}</p>
      )}
    </div>
  );
}
