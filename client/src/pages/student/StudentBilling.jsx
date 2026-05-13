import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'

const fmt = (n) => `₱${Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const fmtDate = (d) => new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })

const FEE_TYPE_STYLE = {
  TUITION:  { icon: 'school',    iconBg: 'bg-blue-100 text-blue-900',     category: 'Category: Academic' },
  LAB:      { icon: 'science',   iconBg: 'bg-purple-100 text-purple-900', category: 'Category: Facility' },
  ELECTIVE: { icon: 'payments',  iconBg: 'bg-emerald-100 text-emerald-900', category: 'Category: Other' },
}

export default function StudentBilling() {
  const navigate = useNavigate()
  const [account, setAccount] = useState(null)
  const [fees, setFees] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [accRes, feesRes, txRes] = await Promise.all([
          api.get('/api/students/me'),
          api.get('/api/students/me/fees'),
          api.get('/api/students/me/transactions'),
        ])
        setAccount(accRes.data)
        setFees(feesRes.data)
        setTransactions(txRes.data)
      } catch (err) {
        console.error('StudentBilling load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalFees = fees.reduce((sum, f) => sum + Number(f.amount), 0)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-slate-400 font-medium">Loading...</p>
    </div>
  )

  return (
    <div>
      <nav className="flex items-center gap-1 text-sm text-on-secondary-container mb-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="hover:text-primary transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to dashboard
        </button>
      </nav>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Billing &amp; Invoicing</h1>
          <p className="text-on-surface-variant mt-1">
            {fees[0]?.semester ?? '—'} • Student ID: {account?.student_id ?? '—'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-secondary hover:bg-slate-50 transition-colors shadow-sm">
            Download PDF
          </button>
          <button className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95">
            Pay Total Balance
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-slate-200/50 rounded-xl shadow-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
            <h3 className="text-xl font-bold text-primary mb-6">Statement Breakdown</h3>
            {fees.length === 0 ? (
              <p className="text-sm text-slate-400">No fee records found for this account.</p>
            ) : (
              <div className="space-y-4">
                {fees.map((fee) => {
                  const style = FEE_TYPE_STYLE[fee.fee_type] ?? FEE_TYPE_STYLE.TUITION
                  return (
                    <div key={fee.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${style.iconBg}`}>
                          <span className="material-symbols-outlined">{style.icon}</span>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-on-secondary-container">{style.category}</p>
                          <p className="text-sm font-bold mt-0.5">{fee.course_name}</p>
                          <p className="text-xs text-slate-400">{fee.course_code}{fee.units ? ` • ${fee.units} units` : ''}</p>
                        </div>
                      </div>
                      <p className="text-base font-semibold text-primary">{fmt(fee.amount)}</p>
                    </div>
                  )
                })}
              </div>
            )}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-end gap-2">
              <div className="flex items-center gap-12 mt-2">
                <span className="text-2xl font-bold text-primary">Total Balance</span>
                <span className="text-2xl font-bold text-primary">{fmt(totalFees)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/50 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold">Transaction History</h3>
            </div>
            {transactions.length === 0 ? (
              <p className="px-6 py-8 text-sm text-slate-400">No transactions recorded yet.</p>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-white text-on-surface-variant">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Reference</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Method</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-slate-600">{fmtDate(tx.payment_date || tx.created_at)}</td>
                      <td className="px-6 py-4 text-sm font-mono text-slate-400">{tx.reference_no}</td>
                      <td className="px-6 py-4 text-sm">{tx.payment_method}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[12px] font-bold ${tx.status === 'CLEARED' ? 'bg-[#10b98126] text-[#059669]' : 'bg-slate-100 text-slate-500'}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-right">{fmt(tx.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200/50 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-amber-500">campaign</span>
              <h3 className="text-lg font-bold">Adjustment Notices</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-sm font-bold text-primary mb-1">No adjustments</p>
                <p className="text-sm text-on-surface-variant">No course adjustments have been processed.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
