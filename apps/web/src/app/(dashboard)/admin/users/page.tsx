import { cookies } from 'next/headers';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';

const roleBadge: Record<string, 'blue' | 'green' | 'purple' | 'yellow' | 'gray'> = {
  SUPER_ADMIN: 'blue', ORG_ADMIN: 'purple', TEACHER: 'green', STUDENT: 'gray', PARENT: 'yellow',
};

async function getUsers(token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/users`,
    { headers: { Cookie: `accessToken=${token}` }, cache: 'no-store' },
  );
  if (!res.ok) return [];
  return res.json();
}

export default async function UsersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value || '';
  const users = await getUsers(token);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-500">{users.length} total users in your organization</p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="pb-3 font-semibold text-gray-600">Name</th>
                <th className="pb-3 font-semibold text-gray-600">Email</th>
                <th className="pb-3 font-semibold text-gray-600">Role</th>
                <th className="pb-3 font-semibold text-gray-600">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-3 font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="py-3 text-gray-500">{user.email}</td>
                  <td className="py-3">
                    <Badge color={roleBadge[user.role] ?? 'gray'}>{user.role}</Badge>
                  </td>
                  <td className="py-3 text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <p className="py-8 text-center text-gray-400">No users found</p>
          )}
        </div>
      </Card>
    </div>
  );
}
