import { cookies } from 'next/headers';
import Link from 'next/link';
import { BookMarked, ArrowRight } from 'lucide-react';
import { Card } from '../../../../components/ui/Card';

async function getBookmarks(token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/bookmarks`,
    { headers: { Cookie: `accessToken=${token}` }, cache: 'no-store' },
  );
  if (!res.ok) return [];
  return res.json();
}

export default async function StudentBookmarksPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value || '';
  const bookmarks = await getBookmarks(token);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Bookmarks</h1>
      <p className="mb-8 text-gray-500">Lessons you&apos;ve saved for later</p>

      <Card>
        {bookmarks.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <BookMarked className="h-12 w-12 text-gray-300" />
            <p className="text-gray-500">No bookmarks yet.</p>
            <p className="text-sm text-gray-400">Bookmark lessons you want to revisit.</p>
            <Link href="/student/courses" className="text-sm font-medium text-blue-600 hover:underline">
              Browse courses →
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {bookmarks.map((bm: any) => (
              <Link
                key={bm.id}
                href={`/student/courses/${bm.lesson?.module?.courseId}/lessons/${bm.lessonId}`}
                className="flex flex-col gap-2 rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-2">
                  <BookMarked className="h-4 w-4 text-blue-500 shrink-0" />
                  <p className="font-medium text-gray-900 truncate">{bm.lesson?.title ?? 'Lesson'}</p>
                </div>
                <p className="text-xs text-gray-400 truncate">{bm.lesson?.module?.course?.title ?? ''}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{new Date(bm.createdAt).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1 text-xs text-blue-600">Continue <ArrowRight className="h-3 w-3" /></span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
