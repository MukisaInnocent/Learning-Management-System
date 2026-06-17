import { cookies } from 'next/headers';
import { HelpCircle } from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';

async function fetchApi(path: string, token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}${path}`,
    { headers: { Cookie: `accessToken=${token}` }, cache: 'no-store' },
  );
  if (!res.ok) return null;
  return res.json();
}

const DIFF_COLOR: Record<string, 'green' | 'yellow' | 'red'> = {
  EASY: 'green', MEDIUM: 'yellow', HARD: 'red',
};

export default async function TeacherQuestionBankPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value || '';

  const params = new URLSearchParams();
  if (sp.difficulty) params.set('difficulty', sp.difficulty);
  if (sp.type) params.set('type', sp.type);
  if (sp.subjectId) params.set('subjectId', sp.subjectId);

  const [questions, subjects] = await Promise.all([
    fetchApi(`/question-bank?${params}`, token),
    fetchApi('/subjects', token),
  ]);

  const qList = questions ?? [];
  const sList = subjects ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Question Bank</h1>
        <p className="text-gray-500">Manage reusable exam questions</p>
      </div>

      <form method="GET" className="mb-6 flex flex-wrap gap-4">
        <select
          name="subjectId"
          defaultValue={sp.subjectId ?? ''}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
        >
          <option value="">All Subjects</option>
          {sList.map((s: any) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <select
          name="difficulty"
          defaultValue={sp.difficulty ?? ''}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
        >
          <option value="">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
        <select
          name="type"
          defaultValue={sp.type ?? ''}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
        >
          <option value="">All Types</option>
          <option value="MCQ">Multiple Choice</option>
          <option value="TRUE_FALSE">True/False</option>
          <option value="SHORT_ANSWER">Short Answer</option>
          <option value="ESSAY">Essay</option>
        </select>
        <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Filter
        </button>
      </form>

      <Card>
        {qList.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <HelpCircle className="h-12 w-12 text-gray-300" />
            <p className="text-gray-500">No questions found.</p>
            <p className="text-sm text-gray-400">Questions can be added via the API or imported.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {qList.map((q: any, i: number) => (
              <div key={q.id} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-start gap-3">
                  <span className="text-sm font-bold text-gray-400 shrink-0 w-6">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge color={DIFF_COLOR[q.difficulty] ?? 'blue'}>{q.difficulty}</Badge>
                      <Badge color="blue">{q.type?.replace('_', ' ')}</Badge>
                      {q.subject && <Badge color="green">{q.subject.name}</Badge>}
                      {q.points && <span className="text-xs text-gray-400">{q.points} pts</span>}
                    </div>
                    <p className="text-sm text-gray-900 font-medium">{q.question}</p>
                    {q.options?.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {q.options.map((opt: any) => (
                          <li key={opt.id} className={`text-xs px-2 py-1 rounded ${opt.isCorrect ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-500'}`}>
                            {opt.option}
                          </li>
                        ))}
                      </ul>
                    )}
                    {q.explanation && (
                      <p className="mt-2 text-xs text-blue-600 italic">Explanation: {q.explanation}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
