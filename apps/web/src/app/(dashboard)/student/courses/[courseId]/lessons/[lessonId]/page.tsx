'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, ArrowLeft, BookMarked, FileText, Save, Trash2 } from 'lucide-react';
import api from '../../../../../../../lib/api';
import { Button } from '../../../../../../../components/ui/Button';
import { Badge } from '../../../../../../../components/ui/Badge';

export default function LessonViewerPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const router = useRouter();
  const [lesson, setLesson] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [marking, setMarking] = useState(false);

  // Notes
  const [note, setNote] = useState('');
  const [savedNote, setSavedNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteId, setNoteId] = useState<string | null>(null);

  // Bookmarks
  const [bookmarked, setBookmarked] = useState(false);
  const [togglingBm, setTogglingBm] = useState(false);

  const noteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    api.get(`/courses/lessons/${lessonId}`).then((r) => setLesson(r.data));
    api.get(`/progress/lessons/${lessonId}`).then((r) => setProgress(r.data)).catch(() => {});
    api.get(`/notes/lesson/${lessonId}`).then((r) => {
      if (r.data) { setNote(r.data.content); setSavedNote(r.data.content); setNoteId(r.data.id); }
    }).catch(() => {});
    api.get(`/bookmarks/lessons/${lessonId}`).then((r) => setBookmarked(!!r.data?.id)).catch(() => {});
  }, [lessonId]);

  const markComplete = async () => {
    setMarking(true);
    try {
      await api.post(`/progress/lessons/${lessonId}/complete`);
      setProgress({ completed: true });
    } finally {
      setMarking(false);
    }
  };

  const saveNote = async () => {
    if (note === savedNote) return;
    setSavingNote(true);
    try {
      const r = await api.post(`/notes/lesson/${lessonId}`, { content: note });
      setSavedNote(note);
      setNoteId(r.data.id);
    } finally {
      setSavingNote(false);
    }
  };

  const deleteNote = async () => {
    if (!noteId) return;
    await api.delete(`/notes/${noteId}`);
    setNote(''); setSavedNote(''); setNoteId(null);
  };

  const handleNoteChange = (v: string) => {
    setNote(v);
    if (noteTimerRef.current) clearTimeout(noteTimerRef.current);
    noteTimerRef.current = setTimeout(() => {
      if (v !== savedNote) {
        setSavingNote(true);
        api.post(`/notes/lesson/${lessonId}`, { content: v })
          .then((r) => { setSavedNote(v); setNoteId(r.data.id); })
          .finally(() => setSavingNote(false));
      }
    }, 1500);
  };

  const toggleBookmark = async () => {
    setTogglingBm(true);
    try {
      const r = await api.post(`/bookmarks/lessons/${lessonId}/toggle`);
      setBookmarked(r.data.bookmarked ?? !bookmarked);
    } finally {
      setTogglingBm(false);
    }
  };

  if (!lesson) return <div className="text-gray-500">Loading lesson…</div>;

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push(`/student/courses/${courseId}`)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to course
        </button>
        <button
          type="button"
          onClick={toggleBookmark}
          disabled={togglingBm}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            bookmarked
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              : 'border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600'
          }`}
        >
          <BookMarked className="h-4 w-4" />
          {bookmarked ? 'Bookmarked' : 'Bookmark'}
        </button>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <Badge color="blue">{lesson.type}</Badge>
        {progress?.completed && <Badge color="green">Completed</Badge>}
      </div>

      <h1 className="mb-4 text-2xl font-bold text-gray-900">{lesson.title}</h1>
      {lesson.description && <p className="mb-6 text-gray-500">{lesson.description}</p>}

      <div className="mb-8 rounded-xl border border-gray-200 bg-white overflow-hidden">
        {lesson.type === 'VIDEO' && lesson.videoUrl && (
          <div className="aspect-video bg-black">
            <iframe
              src={lesson.videoUrl}
              className="h-full w-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        )}
        {lesson.type === 'TEXT' && lesson.content && (
          <div className="prose max-w-none p-8" dangerouslySetInnerHTML={{ __html: lesson.content }} />
        )}
        {lesson.type === 'DOCUMENT' && lesson.documentUrl && (
          <div className="p-8 text-center">
            <a href={lesson.documentUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">
              Open Document
            </a>
          </div>
        )}
        {lesson.type === 'LINK' && lesson.externalUrl && (
          <div className="p-8 text-center">
            <a href={lesson.externalUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">
              Open External Link
            </a>
          </div>
        )}
      </div>

      {/* Notes panel */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <FileText className="h-4 w-4 text-blue-500" /> My Notes
          </div>
          <div className="flex items-center gap-2">
            {savingNote && <span className="text-xs text-gray-400">Saving…</span>}
            {!savingNote && savedNote && <span className="text-xs text-green-500">Saved</span>}
            {noteId && (
              <button type="button" aria-label="Delete note" onClick={deleteNote} className="text-red-400 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={saveNote}
              disabled={savingNote || note === savedNote}
              className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-40"
            >
              <Save className="h-3 w-3" /> Save
            </button>
          </div>
        </div>
        <textarea
          value={note}
          onChange={(e) => handleNoteChange(e.target.value)}
          placeholder="Take notes for this lesson…"
          rows={4}
          className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-blue-400 focus:outline-none"
        />
      </div>

      {lesson.quizzes?.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Quizzes</h2>
          <div className="space-y-2">
            {lesson.quizzes.map((quiz: any) => (
              <button
                key={quiz.id}
                onClick={() => router.push(`/student/courses/${courseId}/quizzes/${quiz.id}`)}
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <span className="font-medium text-gray-900">{quiz.title}</span>
                <Badge color="purple">Take Quiz</Badge>
              </button>
            ))}
          </div>
        </div>
      )}

      {!progress?.completed && (
        <Button onClick={markComplete} loading={marking} size="lg">
          <CheckCircle className="h-4 w-4" />
          Mark as Complete
        </Button>
      )}
    </div>
  );
}
