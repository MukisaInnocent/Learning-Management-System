'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Trash2, ArrowLeft, BookOpen, PlayCircle, FileText, ChevronDown, ChevronRight, ClipboardList } from 'lucide-react';
import api from '../../../../../../lib/api';
import { Button } from '../../../../../../components/ui/Button';
import { Input } from '../../../../../../components/ui/Input';
import { Badge } from '../../../../../../components/ui/Badge';

export default function CourseEditorPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [addingModule, setAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [addingLesson, setAddingLesson] = useState<string | null>(null);
  const [newLesson, setNewLesson] = useState({ title: '', type: 'TEXT', content: '', videoUrl: '' });

  const reload = () => api.get(`/courses/${courseId}`).then((r) => setCourse(r.data));

  useEffect(() => { reload(); }, [courseId]);

  const togglePublish = async () => {
    const newStatus = course.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    await api.patch(`/courses/${courseId}`, { status: newStatus });
    reload();
  };

  const addModule = async () => {
    if (!newModuleTitle.trim()) return;
    const order = (course.modules?.length ?? 0) + 1;
    await api.post(`/courses/${courseId}/modules`, { title: newModuleTitle, order });
    setNewModuleTitle('');
    setAddingModule(false);
    reload();
  };

  const deleteModule = async (moduleId: string) => {
    if (!confirm('Delete this module and all its lessons?')) return;
    await api.delete(`/courses/modules/${moduleId}`);
    reload();
  };

  const addLesson = async (moduleId: string) => {
    const mod = course.modules.find((m: any) => m.id === moduleId);
    const order = (mod?.lessons?.length ?? 0) + 1;
    await api.post(`/courses/modules/${moduleId}/lessons`, { ...newLesson, order });
    setAddingLesson(null);
    setNewLesson({ title: '', type: 'TEXT', content: '', videoUrl: '' });
    reload();
  };

  const deleteLesson = async (lessonId: string) => {
    if (!confirm('Delete this lesson?')) return;
    await api.delete(`/courses/lessons/${lessonId}`);
    reload();
  };

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (!course) return <div className="text-gray-500">Loading…</div>;

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => router.push('/teacher')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Back to courses
        </button>
        <div className="flex items-center gap-3">
          <Badge color={course.status === 'PUBLISHED' ? 'green' : 'gray'}>{course.status}</Badge>
          <Button variant="secondary" onClick={togglePublish}>
            {course.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
          </Button>
        </div>
      </div>

      <h1 className="mb-1 text-2xl font-bold text-gray-900">{course.title}</h1>
      {course.description && <p className="mb-6 text-gray-500">{course.description}</p>}

      <div className="space-y-3">
        {course.modules?.map((mod: any, mi: number) => (
          <div key={mod.id} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100">
              <button onClick={() => toggleModule(mod.id)} className="text-gray-400 hover:text-gray-600">
                {expandedModules.has(mod.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              <span className="flex-1 font-semibold text-gray-900">
                Module {mi + 1}: {mod.title}
              </span>
              <button onClick={() => deleteModule(mod.id)} className="text-red-400 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {expandedModules.has(mod.id) && (
              <div>
                {mod.lessons?.map((lesson: any, li: number) => (
                  <div key={lesson.id} className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 last:border-0">
                    <BookOpen className="h-4 w-4 text-gray-400" />
                    <span className="flex-1 text-sm text-gray-700">{li + 1}. {lesson.title}</span>
                    <Badge color="gray">{lesson.type}</Badge>
                    <button onClick={() => deleteLesson(lesson.id)} className="text-red-400 hover:text-red-600">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {addingLesson === mod.id ? (
                  <div className="p-4 bg-blue-50 border-t border-blue-100">
                    <div className="flex flex-col gap-3">
                      <Input
                        placeholder="Lesson title"
                        value={newLesson.title}
                        onChange={(e) => setNewLesson((p) => ({ ...p, title: e.target.value }))}
                      />
                      <select
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        value={newLesson.type}
                        onChange={(e) => setNewLesson((p) => ({ ...p, type: e.target.value }))}
                      >
                        <option value="TEXT">Text / Notes</option>
                        <option value="VIDEO">Video</option>
                        <option value="DOCUMENT">Document</option>
                        <option value="LINK">External Link</option>
                      </select>
                      {newLesson.type === 'VIDEO' && (
                        <Input
                          placeholder="Video URL (YouTube embed or Cloudflare Stream)"
                          value={newLesson.videoUrl}
                          onChange={(e) => setNewLesson((p) => ({ ...p, videoUrl: e.target.value }))}
                        />
                      )}
                      {newLesson.type === 'TEXT' && (
                        <textarea
                          placeholder="Lesson content (HTML supported)"
                          rows={4}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                          value={newLesson.content}
                          onChange={(e) => setNewLesson((p) => ({ ...p, content: e.target.value }))}
                        />
                      )}
                      <div className="flex gap-2">
                        <Button onClick={() => addLesson(mod.id)}>Add Lesson</Button>
                        <Button variant="ghost" onClick={() => setAddingLesson(null)}>Cancel</Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { setAddingLesson(mod.id); setExpandedModules((p) => new Set([...p, mod.id])); }}
                    className="flex w-full items-center gap-2 px-5 py-3 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Plus className="h-4 w-4" /> Add lesson
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {addingModule ? (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex gap-3">
              <Input
                placeholder="Module title"
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                className="flex-1"
              />
              <Button onClick={addModule}>Add</Button>
              <Button variant="ghost" onClick={() => setAddingModule(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAddingModule(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-4 text-sm text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Module
          </button>
        )}
      </div>
    </div>
  );
}
