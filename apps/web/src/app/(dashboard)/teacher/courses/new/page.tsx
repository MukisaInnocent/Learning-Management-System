'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import api from '../../../../../lib/api';
import { Button } from '../../../../../components/ui/Button';
import { Input } from '../../../../../components/ui/Input';
import { Card } from '../../../../../components/ui/Card';

const schema = z.object({
  title: z.string().min(1, 'Required'),
  description: z.string().optional(),
  academicLevelId: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']),
});
type FormData = z.infer<typeof schema>;

export default function NewCoursePage() {
  const router = useRouter();
  const [levels, setLevels] = useState<any[]>([]);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'DRAFT' },
  });

  useEffect(() => {
    api.get('/academic/levels').then((r) => setLevels(r.data)).catch(() => {});
  }, []);

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      const res = await api.post('/courses', data);
      router.push(`/teacher/courses/${res.data.id}/edit`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create course');
    }
  };

  return (
    <div className="max-w-2xl">
      <button onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Create New Course</h1>

      <Card>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Course Title" placeholder="e.g. Mathematics Term 1 – P4" error={errors.title?.message} {...register('title')} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              placeholder="What will students learn in this course?"
              rows={3}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              {...register('description')}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Academic Level</label>
            <select
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              {...register('academicLevelId')}
            >
              <option value="">Select level (optional)</option>
              {levels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              {...register('status')}
            >
              <option value="DRAFT">Draft (not visible to students)</option>
              <option value="PUBLISHED">Published (visible to students)</option>
            </select>
          </div>
          <Button type="submit" loading={isSubmitting} size="lg" className="mt-2">
            Create Course
          </Button>
        </form>
      </Card>
    </div>
  );
}
