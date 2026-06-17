import { cookies } from 'next/headers';
import { Users2, Search } from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';

async function getStudents(token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/students`,
    { headers: { Cookie: `accessToken=${token}` }, cache: 'no-store' },
  );
  if (!res.ok) return [];
  return res.json();
}

export default async function AdminStudentsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value || '';
  const students = await getStudents(token);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <p className="text-gray-500">View and manage all enrolled students</p>
      </div>

      <Card>
        {students.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Users2 className="h-12 w-12 text-gray-300" />
            <p className="text-gray-500">No students registered yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 text-left font-semibold text-gray-500">Student</th>
                  <th className="pb-3 text-left font-semibold text-gray-500">Email</th>
                  <th className="pb-3 text-left font-semibold text-gray-500">Level</th>
                  <th className="pb-3 text-right font-semibold text-gray-500">Enrollments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.map((s: any) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                          {s.firstName?.[0]}{s.lastName?.[0]}
                        </div>
                        <span className="font-medium text-gray-900">{s.firstName} {s.lastName}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-gray-500">{s.email}</td>
                    <td className="py-3 pr-4">
                      {s.studentProfile?.level ? (
                        <Badge color="green">{s.studentProfile.level.name}</Badge>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3 text-right text-gray-500">{s._count?.enrollments ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
