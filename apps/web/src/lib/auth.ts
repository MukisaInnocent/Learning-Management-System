import api from './api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT' | 'EXAMINER' | 'CONTENT_CREATOR';
  organizationId: string;
  avatarUrl?: string;
  organization?: { id: string; name: string; slug: string };
}

export async function getMe(): Promise<User | null> {
  try {
    const res = await api.get('/auth/me');
    return res.data;
  } catch {
    return null;
  }
}

export async function login(email: string, password: string) {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
}

export async function register(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  organizationId: string;
  organizationName?: string;
  organizationSlug?: string;
}) {
  const res = await api.post('/auth/register', data);
  return res.data;
}

export async function logout() {
  await api.post('/auth/logout');
}

export function getDashboardPath(role: User['role']): string {
  switch (role) {
    case 'SUPER_ADMIN':
    case 'ORG_ADMIN':
      return '/admin';
    case 'TEACHER':
      return '/teacher';
    case 'STUDENT':
      return '/student';
    case 'PARENT':
      return '/parent';
    default:
      return '/student';
  }
}
