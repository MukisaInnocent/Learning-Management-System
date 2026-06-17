import { Award, CheckCircle, XCircle, Search } from 'lucide-react';

async function verifyCert(code: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/certificates/verify/${encodeURIComponent(code)}`,
      { cache: 'no-store' },
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function VerifyCertificatePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const code = sp.code?.trim() ?? '';
  const cert = code ? await verifyCert(code) : null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">
            <Award className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Certificate Verification</h1>
          <p className="mt-2 text-gray-500">Enter a verification code to confirm a certificate&apos;s authenticity</p>
        </div>

        {/* Search form */}
        <form method="GET" className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              name="code"
              defaultValue={code}
              placeholder="Enter verification code…"
              className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Search className="h-4 w-4" /> Verify
            </button>
          </div>
        </form>

        {/* Result */}
        {code && (
          cert ? (
            <div className="rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <CheckCircle className="h-7 w-7 text-green-500 shrink-0" />
                <div>
                  <p className="font-bold text-green-800">Certificate Verified</p>
                  <p className="text-sm text-green-600">This certificate is authentic and was issued by EduPlatform</p>
                </div>
              </div>
              <div className="divide-y divide-green-100 rounded-xl bg-white border border-green-100 overflow-hidden">
                {[
                  ['Student', `${cert.student?.firstName} ${cert.student?.lastName}`],
                  ['Course', cert.course?.title],
                  ['Certificate No.', cert.certificateNumber],
                  ['Issued On', new Date(cert.issuedAt).toLocaleDateString('en-UG', { dateStyle: 'long' })],
                  cert.score != null && ['Score', `${cert.score}%`],
                  cert.grade && ['Grade', cert.grade],
                ].filter(Boolean).map(([label, value]: any) => (
                  <div key={label} className="flex justify-between px-4 py-3 text-sm">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-6">
              <div className="flex items-center gap-3">
                <XCircle className="h-7 w-7 text-red-500 shrink-0" />
                <div>
                  <p className="font-bold text-red-800">Certificate Not Found</p>
                  <p className="text-sm text-red-600">
                    No certificate matches the code <span className="font-mono font-bold">{code}</span>. Check the code and try again.
                  </p>
                </div>
              </div>
            </div>
          )
        )}

        {!code && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-gray-400">
              The verification code can be found on the certificate itself.
            </p>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-gray-400">
          Powered by EduPlatform · Uganda&apos;s Digital School Platform
        </p>
      </div>
    </div>
  );
}
