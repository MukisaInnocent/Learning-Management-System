import { cookies } from 'next/headers';
import { BarChart2 } from 'lucide-react';
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

const GRADE_COLOR: Record<string, 'green' | 'blue' | 'yellow' | 'red'> = {
  A: 'green', B: 'blue', C: 'yellow', D: 'yellow', F: 'red',
};

export default async function TeacherGradebookPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value || '';

  const [courses, scales, categories] = await Promise.all([
    fetchApi('/courses', token),
    fetchApi('/gradebook/scales', token),
    fetchApi('/gradebook/categories', token),
  ]);

  const courseList = courses ?? [];
  const selectedCourseId = sp.courseId ?? courseList[0]?.id ?? '';

  const results = selectedCourseId
    ? await fetchApi(`/gradebook/results?courseId=${selectedCourseId}`, token)
    : null;

  const resultList = results ?? [];
  const catList = (categories ?? []).filter((c: any) => c.courseId === selectedCourseId);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gradebook</h1>
        <p className="text-gray-500">View student grades and course results</p>
      </div>

      {courseList.length > 0 && (
        <form method="GET" className="mb-6">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-500">Course</label>
            <select
              name="courseId"
              defaultValue={selectedCourseId}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
            >
              {courseList.map((c: any) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Load
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card title="Student Results">
            {resultList.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <BarChart2 className="h-10 w-10 text-gray-300" />
                <p className="text-sm text-gray-400">
                  {selectedCourseId
                    ? 'No results computed yet. Use the Gradebook API to compute results.'
                    : 'Select a course to view results.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-3 text-left font-semibold text-gray-500">Student</th>
                      <th className="pb-3 text-right font-semibold text-gray-500">Score</th>
                      <th className="pb-3 text-right font-semibold text-gray-500">Grade</th>
                      <th className="pb-3 text-right font-semibold text-gray-500">Position</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {resultList.map((r: any) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                              {r.student?.firstName?.[0]}{r.student?.lastName?.[0]}
                            </div>
                            <span className="font-medium text-gray-900">
                              {r.student?.firstName} {r.student?.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-right font-semibold text-gray-900">
                          {Math.round(r.percentage ?? 0)}%
                        </td>
                        <td className="py-3 pr-4 text-right">
                          {r.grade ? (
                            <Badge color={GRADE_COLOR[r.grade[0]] ?? 'blue'}>{r.grade}</Badge>
                          ) : '—'}
                        </td>
                        <td className="py-3 text-right text-gray-500">
                          {r.position ? `#${r.position}` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Grade Scale">
            {!scales || scales.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">No scales configured.</p>
            ) : (
              <div className="space-y-1">
                {scales.map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between py-1.5">
                    <Badge color={GRADE_COLOR[s.grade[0]] ?? 'blue'}>{s.grade}</Badge>
                    <span className="text-sm text-gray-500">{s.minScore}–{s.maxScore}%</span>
                    <span className="text-xs text-gray-400">{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {catList.length > 0 && (
            <Card title="Grade Categories">
              <div className="space-y-2">
                {catList.map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{c.name}</span>
                    <Badge color="blue">{c.weight}%</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
