import { cookies } from 'next/headers';
import { BookOpen, Zap } from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';

async function fetchApi(path: string, token: string, options?: RequestInit) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}${path}`,
    { ...options, headers: { Cookie: `accessToken=${token}`, 'Content-Type': 'application/json', ...(options?.headers ?? {}) }, cache: 'no-store' },
  );
  if (!res.ok) return null;
  return res.json();
}

export default async function AdminSubjectsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value || '';
  const subjects = await fetchApi('/subjects', token) ?? [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
          <p className="text-gray-500">Manage curriculum subjects for your organization</p>
        </div>
        <form action={async () => {
          'use server';
          // seed action handled client-side below
        }}>
          <SeedButton token={token} />
        </form>
      </div>

      <Card>
        {subjects.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <BookOpen className="h-12 w-12 text-gray-300" />
            <div>
              <p className="font-medium text-gray-700">No subjects yet</p>
              <p className="text-sm text-gray-400">Seed default subjects to get started</p>
            </div>
            <SeedButtonClient token={token} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 text-left font-semibold text-gray-500">Code</th>
                  <th className="pb-3 text-left font-semibold text-gray-500">Name</th>
                  <th className="pb-3 text-left font-semibold text-gray-500">Description</th>
                  <th className="pb-3 text-right font-semibold text-gray-500">Courses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {subjects.map((s: any) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="py-3 pr-4">
                      <Badge color="blue">{s.code}</Badge>
                    </td>
                    <td className="py-3 pr-4 font-medium text-gray-900">{s.name}</td>
                    <td className="py-3 pr-4 text-gray-500">{s.description ?? '—'}</td>
                    <td className="py-3 text-right text-gray-500">{s._count?.courses ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {subjects.length > 0 && (
        <div className="mt-4 flex justify-end">
          <SeedButtonClient token={token} />
        </div>
      )}
    </div>
  );
}

function SeedButton({ token }: { token: string }) {
  return null;
}

function SeedButtonClient({ token }: { token: string }) {
  return (
    <SeedForm token={token} />
  );
}

// Server Action form for seeding
import { redirect } from 'next/navigation';

async function seedSubjectsAction(token: string) {
  'use server';
  await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/subjects/seed`,
    { method: 'POST', headers: { Cookie: `accessToken=${token}` }, cache: 'no-store' },
  );
  redirect('/admin/subjects');
}

function SeedForm({ token }: { token: string }) {
  const action = seedSubjectsAction.bind(null, token);
  return (
    <form action={action}>
      <button
        type="submit"
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
      >
        <Zap className="h-4 w-4" />
        Seed Default Subjects
      </button>
    </form>
  );
}
