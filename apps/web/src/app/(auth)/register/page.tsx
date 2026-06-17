'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { register as registerUser, getDashboardPath } from '../../../lib/auth';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
  role: z.enum(['STUDENT', 'TEACHER', 'ORG_ADMIN']),
  orgMode: z.enum(['existing', 'new']),
  organizationId: z.string().optional(),
  organizationName: z.string().optional(),
  organizationSlug: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'STUDENT', orgMode: 'existing' },
  });

  const orgMode = watch('orgMode');

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      const payload: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: data.role,
        organizationId: data.orgMode === 'new' ? crypto.randomUUID() : data.organizationId,
      };
      if (data.orgMode === 'new') {
        payload.organizationName = data.organizationName;
        payload.organizationSlug = data.organizationSlug?.toLowerCase().replace(/\s+/g, '-');
      }
      const res = await registerUser(payload);
      router.push(getDashboardPath(res.user.role));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <h2 className="mb-1 text-xl font-bold text-gray-900">Create account</h2>
      <p className="mb-6 text-sm text-gray-500">Join EduPlatform as a student, teacher, or school admin</p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex gap-3">
          <Input label="First name" error={errors.firstName?.message} {...register('firstName')} />
          <Input label="Last name" error={errors.lastName?.message} {...register('lastName')} />
        </div>
        <Input label="Email address" type="email" error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" error={errors.password?.message} {...register('password')} />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">I am a</label>
          <select
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            {...register('role')}
          >
            <option value="STUDENT">Student</option>
            <option value="TEACHER">Teacher</option>
            <option value="ORG_ADMIN">School Administrator</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">School / Organization</label>
          <select
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            {...register('orgMode')}
          >
            <option value="existing">Join existing school (enter ID)</option>
            <option value="new">Register a new school</option>
          </select>
        </div>

        {orgMode === 'existing' ? (
          <Input
            label="Organization ID"
            placeholder="Paste the ID your admin shared"
            error={errors.organizationId?.message}
            {...register('organizationId')}
          />
        ) : (
          <>
            <Input
              label="School name"
              placeholder="St. Mary's Primary School"
              error={errors.organizationName?.message}
              {...register('organizationName')}
            />
            <Input
              label="School short name (slug)"
              placeholder="st-marys"
              error={errors.organizationSlug?.message}
              {...register('organizationSlug')}
            />
          </>
        )}

        <Button type="submit" loading={isSubmitting} className="mt-2 w-full" size="lg">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-blue-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
