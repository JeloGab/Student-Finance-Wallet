import { useState, useEffect } from 'react'
import api from '../../lib/api'

const formatAmount = (amount) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount)

const formatAmountShort = (amount) => {
  if (amount >= 1_000_000) return `₱${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `₱${(amount / 1_000).toFixed(1)}K`
  return formatAmount(amount)
}

const timeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

const initials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const handleExportDaily = async () => {
    try {
      const response = await api.get('/api/payments/export?today=true', { responseType: 'blob' })
      const dateStr = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().split('T')[0]
      const url = URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `daily-report-${dateStr}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Failed to export. Please try again.')
    }
  }

  useEffect(() => {
    api.get('/api/admin/dashboard')
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const weekly = stats?.weekly_totals ?? []
  const recentTx = stats?.recent_transactions ?? []

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-primary mb-1">System Dashboard</h2>
          <p className="text-slate-500">Overview of student financial flows and system health.</p>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-12 gap-8">

        {/* Left metrics column */}
        <div className="col-span-12 lg:col-span-4 space-y-6">

          {/* Total Collections Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
            <div className="flex justify-between items-start mb-6">
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="material-symbols-outlined text-primary">payments</span>
              </div>
              <span className="text-emerald-600 text-[10px] font-bold bg-emerald-50 px-2 py-1 rounded">
                {stats ? `${stats.cleared_count} Cleared` : '—'}
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Total Collections</p>
            <h3 className="text-4xl font-extrabold text-primary mb-4">
              {loading ? '—' : formatAmountShort(stats?.total_collections ?? 0)}
            </h3>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-700"
                style={{ width: stats ? `${Math.min((stats.cleared_count / Math.max(stats.cleared_count + stats.on_hold_count, 1)) * 100, 100)}%` : '0%' }}
              />
            </div>
            <p className="mt-2 text-[11px] text-slate-400 font-medium">
              {stats ? `${stats.cleared_count} of ${stats.cleared_count + stats.on_hold_count} students cleared` : 'Loading...'}
            </p>
          </div>

          {/* On Hold Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-400" />
            <div className="flex justify-between items-start mb-6">
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="material-symbols-outlined text-slate-600">pending_actions</span>
              </div>
              {stats?.on_hold_count > 0 && (
                <span className="text-slate-500 text-[10px] font-bold bg-slate-100 px-2 py-1 rounded">Needs Attention</span>
              )}
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Students On Hold</p>
            <h3 className="text-4xl font-extrabold text-slate-800 mb-4">
              {loading ? '—' : stats?.on_hold_count ?? 0}
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Pending payment clearance</span>
          </div>
        </div>

        {/* Collection Trends Chart */}
        <div className="col-span-12 lg:col-span-8 bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-xl font-bold text-primary">Collection Trends</h3>
              <p className="text-sm text-slate-500">Daily payment totals for the last 7 days</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-primary inline-block" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Collected</span>
            </div>
          </div>

          <div className="flex-1 flex items-end gap-4 mb-6 px-2 min-h-[240px]">
            {loading ? (
              <div className="w-full flex items-center justify-center text-slate-400 text-sm">Loading chart...</div>
            ) : weekly.length === 0 ? (
              <div className="w-full flex items-center justify-center text-slate-400 text-sm">No payment data yet</div>
            ) : (
              weekly.map(({ day, pct, total }) => (
                <div key={day} className="flex-1 h-full flex flex-col justify-end gap-1 group">
                  <div className="relative flex flex-col justify-end" style={{ height: '100%' }}>
                    <div
                      className="w-full bg-primary rounded-t-lg transition-all duration-500 group-hover:opacity-80"
                      style={{ height: `${pct}%` }}
                    />
                    {total > 0 && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                        {formatAmountShort(total)}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-center font-bold text-slate-400 mt-2">{day}</span>
                </div>
              ))
            )}
          </div>

          <div className="pt-8 border-t border-slate-100">
            <button
              onClick={handleExportDaily}
              className="w-full flex items-center justify-center gap-3 py-3.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-bold text-primary text-sm"
            >
              <span className="material-symbols-outlined">description</span>
              Export Daily Report
            </button>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="col-span-12 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-xl font-bold text-primary">Recent Transactions</h3>
            <button className="text-sm font-bold text-primary hover:underline">View Full Audit Log</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reference</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Method</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-10 text-center text-sm text-slate-400">Loading...</td>
                  </tr>
                ) : recentTx.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-10 text-center text-sm text-slate-400">No transactions recorded yet.</td>
                  </tr>
                ) : (
                  recentTx.map((tx, i) => (
                    <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                            {initials(tx.student_name)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{tx.student_name ?? 'Unknown'}</p>
                            <p className="text-[11px] text-slate-400">{tx.student_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4 font-data-mono text-sm text-slate-700">{tx.reference_no}</td>
                      <td className="px-8 py-4 text-sm text-slate-600">{tx.payment_method}</td>
                      <td className="px-8 py-4 font-semibold text-primary">{formatAmount(tx.amount)}</td>
                      <td className="px-8 py-4 text-sm text-slate-500">{timeAgo(tx.created_at)}</td>
                      <td className="px-8 py-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <footer className="mt-16 pb-4 text-center text-slate-400 text-[11px] font-medium">
        <p>© 2024 Student Finance Wallet Admin Terminal • All transactions encrypted with 256-bit SSL</p>
      </footer>
    </div>
  )
}
