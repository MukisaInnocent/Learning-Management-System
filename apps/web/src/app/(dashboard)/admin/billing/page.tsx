import { cookies } from 'next/headers';
import { DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
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

const INVOICE_COLOR: Record<string, 'blue' | 'green' | 'yellow' | 'red'> = {
  DRAFT: 'blue', SENT: 'yellow', PAID: 'green', PARTIAL: 'yellow', OVERDUE: 'red',
};

export default async function AdminBillingPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value || '';

  const [summary, invoices, feeStructures] = await Promise.all([
    fetchApi('/billing/summary', token),
    fetchApi('/billing/invoices', token),
    fetchApi('/billing/fees', token),
  ]);

  const invoiceList = invoices ?? [];
  const feeList = feeStructures ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-gray-500">Invoices, payments, and financial overview</p>
      </div>

      {summary && (
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Total Invoiced', value: `UGX ${Number(summary.totalInvoiced ?? 0).toLocaleString()}`, icon: DollarSign, color: 'text-blue-600 bg-blue-50' },
            { label: 'Total Paid', value: `UGX ${Number(summary.totalPaid ?? 0).toLocaleString()}`, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
            { label: 'Outstanding', value: `UGX ${Number(summary.outstanding ?? 0).toLocaleString()}`, icon: AlertCircle, color: 'text-red-600 bg-red-50' },
            { label: 'Invoices', value: summary.invoiceCount ?? 0, icon: TrendingUp, color: 'text-purple-600 bg-purple-50' },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card title="Invoices">
            {invoiceList.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <DollarSign className="h-10 w-10 text-gray-300" />
                <p className="text-gray-400">No invoices yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-2 text-left text-gray-500">Invoice #</th>
                      <th className="pb-2 text-left text-gray-500">Student</th>
                      <th className="pb-2 text-left text-gray-500">Status</th>
                      <th className="pb-2 text-right text-gray-500">Amount</th>
                      <th className="pb-2 text-right text-gray-500">Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {invoiceList.map((inv: any) => (
                      <tr key={inv.id} className="hover:bg-gray-50">
                        <td className="py-2 pr-3 font-mono text-xs text-gray-600">{inv.invoiceNumber}</td>
                        <td className="py-2 pr-3 font-medium text-gray-900">
                          {inv.student?.firstName} {inv.student?.lastName}
                        </td>
                        <td className="py-2 pr-3">
                          <Badge color={INVOICE_COLOR[inv.status] ?? 'blue'}>{inv.status}</Badge>
                        </td>
                        <td className="py-2 pr-3 text-right text-gray-700">
                          {Number(inv.totalAmount).toLocaleString()}
                        </td>
                        <td className="py-2 text-right text-gray-500">
                          {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <Card title="Fee Structures">
          {feeList.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No fee structures defined.</p>
          ) : (
            <div className="space-y-3">
              {feeList.map((f: any) => (
                <div key={f.id} className="rounded-lg border border-gray-100 p-3">
                  <p className="font-medium text-gray-900">{f.name}</p>
                  <p className="text-xs text-gray-400">{f.billingType} · {f.term?.name}</p>
                  <p className="mt-1 font-semibold text-blue-700">UGX {Number(f.amount).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
