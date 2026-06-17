import { cookies } from 'next/headers';
import { Building2, Users, BookOpen } from 'lucide-react';
import { Card } from '../../../../components/ui/Card';

async function getOrg(token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/organizations/mine`,
    { headers: { Cookie: `accessToken=${token}` }, cache: 'no-store' },
  );
  if (!res.ok) return null;
  return res.json();
}

export default async function SchoolsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value || '';
  const org = await getOrg(token);

  if (!org) return <div className="text-red-500">Failed to load organization</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Organization</h1>
        <p className="text-gray-500">Your school&apos;s profile and settings</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card title="Organization Details">
            <div className="space-y-4 text-sm">
              {[
                { label: 'Name', value: org.name },
                { label: 'Slug', value: org.slug, mono: true },
                { label: 'Description', value: org.description || '—' },
                { label: 'Organization ID', value: org.id, mono: true, small: true },
                { label: 'Created', value: new Date(org.createdAt).toLocaleDateString() },
              ].map(({ label, value, mono, small }) => (
                <div key={label} className="flex items-start gap-4 border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                  <span className="w-32 shrink-0 text-gray-500">{label}</span>
                  <span className={`font-medium text-gray-900 ${mono ? 'font-mono' : ''} ${small ? 'text-xs break-all' : ''}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{org._count?.users ?? 0}</p>
                <p className="text-sm text-gray-500">Total Users</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{org._count?.courses ?? 0}</p>
                <p className="text-sm text-gray-500">Total Courses</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-medium text-amber-800">Share your Organization ID with teachers and students</p>
        <p className="mt-1 text-sm text-amber-700">They&apos;ll need it to register and join your school on EduPlatform.</p>
        <code className="mt-2 block rounded bg-white p-2 text-xs font-mono text-gray-700 border border-amber-200 break-all">
          {org.id}
        </code>
      </div>
    </div>
  );
}
