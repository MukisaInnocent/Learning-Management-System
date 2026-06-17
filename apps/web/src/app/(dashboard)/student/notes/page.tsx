import { cookies } from 'next/headers';
import Link from 'next/link';
import { FileText, ArrowRight } from 'lucide-react';
import { Card } from '../../../../components/ui/Card';

async function getNotes(token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/notes`,
    { headers: { Cookie: `accessToken=${token}` }, cache: 'no-store' },
  );
  if (!res.ok) return [];
  return res.json();
}

export default async function StudentNotesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value || '';
  const notes = await getNotes(token);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">My Notes</h1>
      <p className="mb-8 text-gray-500">Notes you&apos;ve taken across all lessons</p>

      <Card>
        {notes.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <FileText className="h-12 w-12 text-gray-300" />
            <p className="text-gray-500">No notes yet.</p>
            <p className="text-sm text-gray-400">You can add notes while watching lessons.</p>
            <Link href="/student/courses" className="text-sm font-medium text-blue-600 hover:underline">
              Browse courses →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notes.map((note: any) => (
              <div key={note.id} className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 mb-1">
                      {note.lesson?.title ?? 'Unknown lesson'} · {note.lesson?.module?.course?.title ?? ''}
                    </p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.content}</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                    {note.lesson?.id && (
                      <Link
                        href={`/student/courses/${note.lesson?.module?.courseId}/lessons/${note.lesson.id}`}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                      >
                        Go to lesson <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
