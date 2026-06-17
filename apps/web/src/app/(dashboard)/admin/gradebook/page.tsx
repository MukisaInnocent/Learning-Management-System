import { cookies } from 'next/headers';
import { BarChart2, Zap } from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { redirect } from 'next/navigation';

async function fetchApi(path: string, token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}${path}`,
    { headers: { Cookie: `accessToken=${token}` }, cache: 'no-store' },
  );
  if (!res.ok) return null;
  return res.json();
}

async function seedScalesAction(token: string) {
  'use server';
  await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/gradebook/scales/seed`,
    { method: 'POST', headers: { Cookie: `accessToken=${token}` }, cache: 'no-store' },
  );
  redirect('/admin/gradebook');
}

export default async function AdminGradebookPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value || '';

  const [scales, categories] = await Promise.all([
    fetchApi('/gradebook/scales', token),
    fetchApi('/gradebook/categories', token),
  ]);

  const seedAction = seedScalesAction.bind(null, token);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gradebook</h1>
          <p className="text-gray-500">Grade scales and category configuration</p>
        </div>
        <form action={seedAction}>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Zap className="h-4 w-4" /> Seed Default Scales
          </button>
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Grade Scales">
          {!scales || scales.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <BarChart2 className="h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-400">No grade scales configured. Seed defaults to start.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-2 text-left text-gray-500">Grade</th>
                    <th className="pb-2 text-left text-gray-500">Label</th>
                    <th className="pb-2 text-right text-gray-500">Min %</th>
                    <th className="pb-2 text-right text-gray-500">Max %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {scales.map((s: any) => (
                    <tr key={s.id}>
                      <td className="py-2 pr-3 font-bold text-blue-700">{s.grade}</td>
                      <td className="py-2 pr-3 text-gray-700">{s.label}</td>
                      <td className="py-2 pr-3 text-right text-gray-600">{s.minScore}</td>
                      <td className="py-2 text-right text-gray-600">{s.maxScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Grade Categories">
          {!categories || categories.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-sm text-gray-400">No grade categories configured.</p>
              <p className="text-xs text-gray-400">Categories are created per course via the gradebook API.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                  <div>
                    <p className="font-medium text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.course?.title}</p>
                  </div>
                  <Badge color="blue">{c.weight}%</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
