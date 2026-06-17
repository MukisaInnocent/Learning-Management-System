import { cookies } from 'next/headers';
import { FileText, Award } from 'lucide-react';
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

export default async function StudentReportCardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value || '';

  const [reportCards, results] = await Promise.all([
    fetchApi('/students/report-cards', token),
    fetchApi('/gradebook/results/me', token),
  ]);

  const cards = reportCards ?? [];
  const myResults = results ?? [];

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Report Cards</h1>
      <p className="mb-8 text-gray-500">Your term results and academic performance</p>

      {cards.length === 0 && myResults.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <FileText className="h-14 w-14 text-gray-200" />
            <div>
              <p className="font-medium text-gray-700">No report cards yet</p>
              <p className="text-sm text-gray-400">Your report card will appear here when published by your teacher.</p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {cards.map((rc: any) => (
            <div key={rc.id} className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              {/* Header */}
              <div className="border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg">{rc.term?.name} · {rc.term?.academicYear?.year}</p>
                    <p className="text-blue-200 text-sm">Report Card</p>
                  </div>
                  <div className="text-right">
                    {rc.overallScore != null && (
                      <p className="text-3xl font-bold">{Math.round(rc.overallScore)}%</p>
                    )}
                    {rc.position && (
                      <p className="text-blue-200 text-sm">Position #{rc.position}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Course results */}
              {rc.courseResults?.length > 0 && (
                <div className="p-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="pb-2 text-left font-semibold text-gray-500">Subject</th>
                        <th className="pb-2 text-right font-semibold text-gray-500">Score</th>
                        <th className="pb-2 text-right font-semibold text-gray-500">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {rc.courseResults.map((cr: any) => (
                        <tr key={cr.id}>
                          <td className="py-2.5 pr-4 font-medium text-gray-900">{cr.course?.title}</td>
                          <td className="py-2.5 pr-4 text-right text-gray-700">{Math.round(cr.percentage ?? 0)}%</td>
                          <td className="py-2.5 text-right">
                            {cr.grade ? (
                              <Badge color={GRADE_COLOR[cr.grade[0]] ?? 'blue'}>{cr.grade}</Badge>
                            ) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Remarks */}
              {rc.remarks?.length > 0 && (
                <div className="border-t border-gray-100 px-6 py-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Teacher Remarks</p>
                  {rc.remarks.map((r: any) => (
                    <p key={r.id} className="text-sm text-gray-700 italic">&ldquo;{r.remark}&rdquo;
                      <span className="ml-2 not-italic text-gray-400">— {r.teacher?.firstName} {r.teacher?.lastName}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Course results without a formal report card */}
          {cards.length === 0 && myResults.length > 0 && (
            <Card title="Course Results">
              <div className="space-y-3">
                {myResults.map((r: any) => (
                  <div key={r.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-4">
                    <div>
                      <p className="font-medium text-gray-900">{r.course?.title}</p>
                      <p className="text-xs text-gray-400">{r.term?.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-900">{Math.round(r.percentage ?? 0)}%</span>
                      {r.grade && <Badge color={GRADE_COLOR[r.grade[0]] ?? 'blue'}>{r.grade}</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
