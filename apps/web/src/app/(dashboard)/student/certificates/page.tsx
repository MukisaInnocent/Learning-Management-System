import { cookies } from 'next/headers';
import { Award, Download, ExternalLink } from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';

async function getCertificates(token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/certificates`,
    { headers: { Cookie: `accessToken=${token}` }, cache: 'no-store' },
  );
  if (!res.ok) return [];
  return res.json();
}

export default async function StudentCertificatesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value || '';
  const certificates = await getCertificates(token);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Certificates</h1>
      <p className="mb-8 text-gray-500">Your earned course completion certificates</p>

      <Card>
        {certificates.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <Award className="h-16 w-16 text-gray-200" />
            <div>
              <p className="font-medium text-gray-700">No certificates yet</p>
              <p className="text-sm text-gray-400">Complete a course to earn your first certificate.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert: any) => (
              <div
                key={cert.id}
                className="flex flex-col gap-3 rounded-xl border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-white p-5"
              >
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="font-bold text-gray-900">{cert.course?.title}</p>
                    <p className="text-xs text-gray-500">Certificate of Completion</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Issued</span>
                    <span>{new Date(cert.issuedAt).toLocaleDateString()}</span>
                  </div>
                  {cert.score != null && (
                    <div className="flex justify-between">
                      <span>Score</span>
                      <span className="font-medium text-green-600">{cert.score}%</span>
                    </div>
                  )}
                  {cert.grade && (
                    <div className="flex justify-between">
                      <span>Grade</span>
                      <Badge color="blue">{cert.grade}</Badge>
                    </div>
                  )}
                </div>
                <div className="pt-1 border-t border-yellow-200">
                  <p className="text-xs text-gray-400 font-mono break-all">{cert.verificationCode}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Verification code</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
