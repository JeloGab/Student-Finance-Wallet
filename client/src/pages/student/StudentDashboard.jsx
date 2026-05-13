import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'

const fmt = (n) => `₱${Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const fmtDate = (d) => new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })

export default function StudentDashboard() {
  const navigate = useNavigate()
  const [account, setAccount] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [accRes, txRes] = await Promise.all([
          api.get('/api/students/me'),
          api.get('/api/students/me/transactions'),
        ])
        setAccount(accRes.data)
        setTransactions(txRes.data.slice(0, 3))
      } catch (err) {
        console.error('StudentDashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const progress = account?.total_due > 0
    ? Math.min((account.total_paid / account.total_due) * 100, 100)
    : 0

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-slate-400 font-medium">Loading...</p>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Academic Ledger Summary</h1>
          <p className="text-on-secondary-container mt-1">
            Welcome back, {account?.student_name ?? 'Student'}. Your account is currently {account?.status === 'CLEARED' ? 'cleared' : 'on hold'}.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12 bg-white rounded-xl border border-slate-200 p-8 relative overflow-hidden" style={{ boxShadow: '0 4px 12px rgba(0, 31, 63, 0.05)' }}>
          <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div className="flex flex-col justify-between space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-on-surface-variant mb-4">Balance Summary</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-primary">{fmt(account?.remaining_balance ?? 0)}</span>
                  <span className="text-sm font-semibold text-on-tertiary-container uppercase tracking-widest">Remaining Balance</span>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/billing')}
                  className="border border-slate-200 text-slate-600 px-6 py-2.5 rounded-lg text-[12px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">history</span>
                  Transaction History
                </button>
              </div>
            </div>

            <div className="flex flex-col justify-center space-y-6 md:border-l md:border-slate-100 md:pl-8">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Due</p>
                <p className="text-2xl font-bold text-slate-900">{fmt(account?.total_due ?? 0)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Paid</p>
                <p className="text-2xl font-bold text-on-tertiary-container">{fmt(account?.total_paid ?? 0)}</p>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-12 bg-white rounded-xl border border-slate-200 overflow-hidden" style={{ boxShadow: '0 4px 12px rgba(0, 31, 63, 0.05)' }}>
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-xl font-bold text-primary">Recent Transactions</h3>
            <button
              onClick={() => navigate('/billing')}
              className="text-sm font-semibold text-on-primary-container hover:text-primary transition-colors"
            >
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            {transactions.length === 0 ? (
              <p className="px-6 py-8 text-sm text-slate-400">No transactions recorded yet.</p>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reference</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Amount</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900 text-sm">Payment via {tx.payment_method}</td>
                      <td className="px-6 py-4 text-slate-500 text-sm">{fmtDate(tx.payment_date || tx.created_at)}</td>
                      <td className="px-6 py-4 text-xs text-slate-400 font-mono">{tx.reference_no}</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900 text-sm">{fmt(tx.amount)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${tx.status === 'CLEARED' ? 'bg-emerald-100 text-on-tertiary-container' : 'bg-slate-100 text-slate-500'}`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
