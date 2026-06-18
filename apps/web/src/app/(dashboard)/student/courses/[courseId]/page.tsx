'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, PlayCircle, FileText, ExternalLink, ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import api from '../../../../../lib/api';
import { Button } from '../../../../../components/ui/Button';
import { Badge } from '../../../../../components/ui/Badge';

interface Lesson {
  id: string;
  title: string;
  type: 'VIDEO' | 'TEXT' | 'DOCUMENT' | 'LINK';
  isPreview?: boolean;
  durationMinutes?: number;
}

interface Module {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description?: string;
  academicLevel?: { name: string };
  createdBy?: { firstName: string; lastName: string };
  modules?: Module[];
  _count?: { enrollments: number };
}

const lessonIcons: Record<string, LucideIcon> = {
  VIDEO: PlayCircle, DOCUMENT: FileText, TEXT: BookOpen, LINK: ExternalLink,
};

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/courses/${courseId}`).then((r) => {
      setCourse(r.data as Course);
      setLoading(false);
    });
    api.get('/courses/enrollments/mine').then((r) => {
      const ids = (r.data as { courseId: string }[]).map((e) => e.courseId);
      setEnrolled(ids.includes(courseId));
    });
  }, [courseId]);

  const enroll = async () => {
    setEnrolling(true);
    try {
      await api.post(`/courses/${courseId}/enroll`);
      setEnrolled(true);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <div className="text-gray-500">Loading course…</div>;
  if (!course) return <div className="text-red-500">Course not found</div>;

  const totalLessons = course.modules?.flatMap((m) => m.lessons).length ?? 0;

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          {course.academicLevel && <Badge color="blue">{course.academicLevel.name}</Badge>}
          <h1 className="mt-2 text-2xl font-bold text-gray-900">{course.title}</h1>
          {course.description && <p className="mt-1 text-gray-500">{course.description}</p>}
          <p className="mt-2 text-sm text-gray-400">
            By {course.createdBy?.firstName} {course.createdBy?.lastName} · {totalLessons} lessons · {course._count?.enrollments ?? 0} enrolled
          </p>
        </div>
        {!enrolled ? (
          <Button onClick={enroll} loading={enrolling} size="lg">
            Enroll Now
          </Button>
        ) : (
          <Badge color="green">Enrolled</Badge>
        )}
      </div>

      <div className="space-y-4">
        {course.modules?.map((mod, mi) => (
          <div key={mod.id} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
              <p className="font-semibold text-gray-900">
                Module {mi + 1}: {mod.title}
              </p>
              {mod.description && <p className="text-sm text-gray-500">{mod.description}</p>}
            </div>
            <div>
              {mod.lessons?.map((lesson, li) => {
                const Icon = lessonIcons[lesson.type] ?? BookOpen;
                return (
                  <Link
                    key={lesson.id}
                    href={enrolled ? `/student/courses/${courseId}/lessons/${lesson.id}` : '#'}
                    className={`flex items-center gap-3 px-5 py-3 border-b border-gray-100 last:border-0 transition-colors ${
                      enrolled || lesson.isPreview
                        ? 'hover:bg-blue-50 cursor-pointer'
                        : 'cursor-default opacity-60'
                    }`}
                  >
                    <Icon className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="flex-1 text-sm text-gray-700">
                      {li + 1}. {lesson.title}
                    </span>
                    {lesson.isPreview && !enrolled && (
                      <Badge color="purple">Preview</Badge>
                    )}
                    {lesson.durationMinutes && (
                      <span className="text-xs text-gray-400">{lesson.durationMinutes}m</span>
                    )}
                    {enrolled && <ChevronRight className="h-4 w-4 text-gray-300" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
