'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import api from '../../../../../../../lib/api';
import { Button } from '../../../../../../../components/ui/Button';

interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  text: string;
  options?: QuizOption[];
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  passingScore: number;
  maxAttempts: number;
  questions?: QuizQuestion[];
}

interface QuizAttempt {
  id: string;
}

interface QuizResult {
  score: number;
}

export default function QuizPage() {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/quizzes/${quizId}`).then((r) => setQuiz(r.data as Quiz));
  }, [quizId]);

  const startQuiz = async () => {
    const res = await api.post(`/quizzes/${quizId}/attempts/start`);
    setAttempt(res.data as QuizAttempt);
  };

  const selectAnswer = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const submit = async () => {
    if (!attempt) return;
    setSubmitting(true);
    try {
      const payload = {
        answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({
          questionId, selectedOptionId,
        })),
      };
      const res = await api.post(`/quizzes/attempts/${attempt.id}/submit`, payload);
      setResult(res.data as QuizResult);
    } finally {
      setSubmitting(false);
    }
  };

  if (!quiz) return <div className="text-gray-500">Loading quiz…</div>;

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <h1 className="mb-2 text-2xl font-bold text-gray-900">{quiz.title}</h1>
      {quiz.description && <p className="mb-4 text-gray-500">{quiz.description}</p>}
      <p className="mb-6 text-sm text-gray-400">
        {quiz.questions?.length} questions · Passing score: {quiz.passingScore}% · Max {quiz.maxAttempts} attempts
      </p>

      {result ? (
        <div className="rounded-xl border-2 border-gray-200 bg-white p-8 text-center">
          {result.score >= quiz.passingScore ? (
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
          ) : (
            <XCircle className="mx-auto mb-4 h-16 w-16 text-red-400" />
          )}
          <p className="text-4xl font-bold text-gray-900 mb-2">{Math.round(result.score)}%</p>
          <p className="text-lg font-medium text-gray-700 mb-4">
            {result.score >= quiz.passingScore ? 'Passed!' : 'Not passed'}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            {result.score >= quiz.passingScore
              ? 'Great job! You passed this quiz.'
              : `You need ${quiz.passingScore}% to pass. Try again!`}
          </p>
          <Button onClick={() => router.push(`/student/courses/${courseId}`)}>
            Back to Course
          </Button>
        </div>
      ) : !attempt ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="mb-6 text-gray-600">Ready to start the quiz? You have {quiz.maxAttempts} attempt(s).</p>
          <Button onClick={startQuiz} size="lg">Start Quiz</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {quiz.questions?.map((q, qi) => (
            <div key={q.id} className="rounded-xl border border-gray-200 bg-white p-6">
              <p className="mb-4 font-semibold text-gray-900">
                {qi + 1}. {q.text}
              </p>
              <div className="space-y-2">
                {q.options?.map((opt) => {
                  const selected = answers[q.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => selectAnswer(q.id, opt.id)}
                      className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors ${
                        selected
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/50 text-gray-700'
                      }`}
                    >
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 shrink-0 ${
                        selected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}>
                        {selected && <div className="h-2 w-2 rounded-full bg-white" />}
                      </div>
                      {opt.text}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <Button
            onClick={submit}
            loading={submitting}
            disabled={Object.keys(answers).length < (quiz.questions?.length ?? 0)}
            size="lg"
            className="w-full"
          >
            Submit Quiz
          </Button>
          {Object.keys(answers).length < (quiz.questions?.length ?? 0) && (
            <p className="text-center text-sm text-gray-400">
              Answer all {quiz.questions?.length} questions to submit
            </p>
          )}
        </div>
      )}
    </div>
  );
}
