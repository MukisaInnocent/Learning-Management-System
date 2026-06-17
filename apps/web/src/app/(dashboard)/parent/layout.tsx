import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Sidebar } from '../../../components/layout/Sidebar';

async function getUser(token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/auth/me`, {
    headers: { Cookie: `accessToken=${token}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value || '';
  const user = await getUser(token);
  if (!user) redirect('/login');
  if (user.role !== 'PARENT') redirect('/login');

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} />
      <main className="flex-1 p-6 lg:p-8">{children}</main>
    </div>
  );
}
