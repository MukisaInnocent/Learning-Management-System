import { cookies } from 'next/headers';
import { UserCheck } from 'lucide-react';
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

const STATUS_COLOR: Record<string, 'green' | 'red' | 'yellow' | 'blue'> = {
  PRESENT: 'green', ABSENT: 'red', LATE: 'yellow', EXCUSED: 'blue',
};

export default async function AdminAttendancePage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value || '';

  const today = new Date().toISOString().split('T')[0];
  const date = sp.date ?? today;

  const terms = await fetchApi('/academic/terms', token) ?? [];
  const termId = sp.termId ?? terms[0]?.id ?? '';

  const records = termId
    ? await fetchApi(`/attendance/date?date=${date}&termId=${termId}`, token) ?? []
    : [];

  const present = records.filter((r: any) => r.attendance?.status === 'PRESENT').length;
  const absent = records.filter((r: any) => r.attendance?.status === 'ABSENT').length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-500">View daily attendance records</p>
      </div>

      <form method="GET" className="mb-6 flex flex-wrap gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Date</label>
          <input
            type="date"
            name="date"
            defaultValue={date}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Term</label>
          <select
            name="termId"
            defaultValue={termId}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
          >
            {terms.map((t: any) => (
              <option key={t.id} value={t.id}>{t.name} ({t.academicYear?.year})</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            View
          </button>
        </div>
      </form>

      {termId && (
        <>
          <div className="mb-6 grid grid-cols-3 gap-4">
            <Card className="text-center py-4">
              <p className="text-3xl font-bold text-gray-900">{records.length}</p>
              <p className="text-sm text-gray-500">Total Students</p>
            </Card>
            <Card className="text-center py-4">
              <p className="text-3xl font-bold text-green-600">{present}</p>
              <p className="text-sm text-gray-500">Present</p>
            </Card>
            <Card className="text-center py-4">
              <p className="text-3xl font-bold text-red-600">{absent}</p>
              <p className="text-sm text-gray-500">Absent</p>
            </Card>
          </div>

          <Card>
            {records.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <UserCheck className="h-12 w-12 text-gray-300" />
                <p className="text-gray-500">No attendance records for this date.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-3 text-left font-semibold text-gray-500">Student</th>
                      <th className="pb-3 text-left font-semibold text-gray-500">Status</th>
                      <th className="pb-3 text-left font-semibold text-gray-500">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {records.map((r: any) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="py-3 pr-4 font-medium text-gray-900">{r.firstName} {r.lastName}</td>
                        <td className="py-3 pr-4">
                          {r.attendance ? (
                            <Badge color={STATUS_COLOR[r.attendance.status] ?? 'blue'}>{r.attendance.status}</Badge>
                          ) : (
                            <span className="text-gray-400 text-xs">Not marked</span>
                          )}
                        </td>
                        <td className="py-3 text-gray-500">{r.attendance?.notes ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
