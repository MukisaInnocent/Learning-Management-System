import { cookies } from 'next/headers';
import Link from 'next/link';
import { Building2, Users, BookOpen, GraduationCap } from 'lucide-react';
import { Card } from '../../../components/ui/Card';

async function getData(path: string, token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}${path}`,
    { headers: { Cookie: `accessToken=${token}` }, cache: 'no-store' },
  );
  if (!res.ok) return [];
  return res.json();
}

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value || '';

  const [org, users, courses, levels] = await Promise.all([
    getData('/organizations/mine', token),
    getData('/users', token),
    getData('/courses', token),
    getData('/academic/levels', token),
  ]);

  const stats = [
    { label: 'Users', value: users.length ?? 0, icon: Users, href: '/admin/users', color: 'text-blue-600 bg-blue-50' },
    { label: 'Courses', value: courses.length ?? 0, icon: BookOpen, href: '/admin/schools', color: 'text-green-600 bg-green-50' },
    { label: 'Academic Levels', value: levels.length ?? 0, icon: GraduationCap, href: '/admin/academic', color: 'text-purple-600 bg-purple-50' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{org.name ?? 'Admin Dashboard'}</h1>
        <p className="text-gray-500">Platform overview and management</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, href, color }) => (
          <Link key={label} href={href}>
            <Card className="flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Quick Links">
          <div className="space-y-2">
            {[
              { href: '/admin/users', label: 'Manage Users & Roles' },
              { href: '/admin/academic', label: 'Manage Academic Levels' },
              { href: '/admin/schools', label: 'Organization Settings' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:border-blue-200 hover:bg-blue-50 transition-colors">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <span className="text-blue-500">→</span>
              </Link>
            ))}
          </div>
        </Card>

        <Card title="Organization Info">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Name</span>
              <span className="font-medium text-gray-900">{org.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Slug</span>
              <span className="font-mono text-gray-900">{org.slug}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">ID</span>
              <span className="font-mono text-xs text-gray-400 break-all">{org.id}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
