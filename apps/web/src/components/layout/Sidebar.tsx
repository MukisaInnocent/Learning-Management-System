'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookOpen, LayoutDashboard, Users,
  GraduationCap, ClipboardList, BarChart2, Building2, LogOut,
  BookMarked, FileText, Award, DollarSign, UserCheck,
  HelpCircle, PenTool, Users2,
} from 'lucide-react';
import { logout, type User } from '../../lib/auth';

const studentNav = [
  { href: '/student', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/student/courses', label: 'My Courses', icon: BookOpen },
  { href: '/student/assignments', label: 'Assignments', icon: ClipboardList },
  { href: '/student/notes', label: 'My Notes', icon: FileText },
  { href: '/student/bookmarks', label: 'Bookmarks', icon: BookMarked },
  { href: '/student/report-card', label: 'Report Card', icon: BarChart2 },
  { href: '/student/certificates', label: 'Certificates', icon: Award },
];

const teacherNav = [
  { href: '/teacher', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/teacher/courses', label: 'My Courses', icon: BookOpen },
  { href: '/teacher/assignments', label: 'Assignments', icon: PenTool },
  { href: '/teacher/question-bank', label: 'Question Bank', icon: HelpCircle },
  { href: '/teacher/gradebook', label: 'Gradebook', icon: BarChart2 },
];

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/schools', label: 'Schools', icon: Building2 },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/academic', label: 'Academic Levels', icon: GraduationCap },
  { href: '/admin/subjects', label: 'Subjects', icon: BookOpen },
  { href: '/admin/students', label: 'Students', icon: Users2 },
  { href: '/admin/attendance', label: 'Attendance', icon: UserCheck },
  { href: '/admin/gradebook', label: 'Gradebook', icon: BarChart2 },
  { href: '/admin/billing', label: 'Billing', icon: DollarSign },
];

const parentNav = [
  { href: '/parent', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/parent/children', label: 'My Children', icon: Users2 },
];

function getNav(role: User['role']) {
  if (role === 'STUDENT') return studentNav;
  if (role === 'TEACHER' || role === 'CONTENT_CREATOR') return teacherNav;
  if (role === 'PARENT') return parentNav;
  return adminNav;
}

export function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const nav = getNav(user.role);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white sticky top-0">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">EduPlatform</p>
          <p className="text-xs text-gray-500 truncate max-w-[140px]">{user.organization?.name}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/student' && href !== '/teacher' && href !== '/admin' && href !== '/parent' && pathname.startsWith(href + '/'));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-sm font-bold">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-gray-500">{user.role.replace(/_/g, ' ')}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
