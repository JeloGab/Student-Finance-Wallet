import { useState, useEffect, useCallback } from 'react'
import api from '../../lib/api'
import { generateReceipt } from '../../lib/receipt'

const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  return {
    date: d.toLocaleDateString('en-PH', { month: 'short', day: '2-digit', year: 'numeric' }),
    time: d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  }
}

const buildDescription = (action, details) => {
  if (!details) return action
  switch (action) {
    case 'PAYMENT_RECORDED':
      return `Payment of ₱${Number(details.amount).toLocaleString()} recorded via ${details.payment_method} (Ref: ${details.reference_no})`
    default:
      return JSON.stringify(details)
  }
}

const statusBadge = (action, details) => {
  const status = details?.new_status ?? 'RECORDED'
  if (status === 'CLEARED') return { label: 'CLEARED', cls: 'bg-emerald-100 text-emerald-700' }
  if (status === 'ON_HOLD') return { label: 'ON HOLD', cls: 'bg-slate-100 text-slate-700' }
  return { label: status, cls: 'bg-slate-100 text-slate-700' }
}

const initials = (email) => {
  if (!email) return '?'
  return email.split('@')[0].slice(0, 2).toUpperCase()
}

export default function ActivityLogs() {
  const [data, setData] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchLogs = useCallback((p) => {
    setLoading(true)
    api.get(`/api/admin/activity-logs?page=${p}`)
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchLogs(page) }, [page, fetchLogs])

  const logs = data?.logs ?? []
  const stats = data?.stats
  const totalPages = data?.total_pages ?? 1
  const total = data?.total ?? 0

  const statCards = [
    {
      label: 'TOTAL LOGS',
      value: stats ? total.toLocaleString() : '—',
      icon: 'database',
      iconClass: 'text-on-primary-container',
      sub: stats ? `${stats.week_count} this week` : '',
      subClass: 'text-on-tertiary-container',
      subIcon: 'trending_up',
    },
    {
      label: "TODAY'S ACTIVITY",
      value: stats ? stats.today_count : '—',
      icon: 'today',
      iconClass: 'text-on-secondary-container',
      sub: 'Actions recorded today',
      subClass: 'text-on-surface-variant',
      subIcon: null,
    },
    {
      label: 'UNIQUE STAFF',
      value: stats ? stats.unique_staff : '—',
      icon: 'admin_panel_settings',
      iconClass: 'text-on-secondary-container',
      sub: 'Staff with recorded actions',
      subClass: 'text-on-surface-variant',
      subIcon: null,
    },
    {
      label: 'THIS WEEK',
      value: stats ? stats.week_count : '—',
      icon: 'calendar_month',
      iconClass: 'text-on-primary-container',
      sub: 'Last 7 days',
      subClass: 'text-on-tertiary-container',
      subIcon: 'check_circle',
    },
  ]

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-primary mb-1">Activity Logs &amp; Audit Trail</h2>
          <p className="text-slate-500">Comprehensive ledger of all secure system interactions and financial adjustments.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-bold text-slate-700 flex items-center gap-2 hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            Export CSV
          </button>
          <button className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-bold text-slate-700 flex items-center gap-2 hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-[18px]">print</span>
            Print Audit
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{s.label}</span>
              <span className={`material-symbols-outlined text-[20px] ${s.iconClass}`}>{s.icon}</span>
            </div>
            <div className="text-2xl font-bold text-primary mb-2">{s.value}</div>
            <div className={`text-sm flex items-center gap-1 ${s.subClass}`}>
              {s.subIcon && <span className="material-symbols-outlined text-[14px]">{s.subIcon}</span>}
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">

        {/* Filtering Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">
              {loading ? 'Loading...' : `Showing ${logs.length === 0 ? 0 : ((page - 1) * 15) + 1}–${((page - 1) * 15) + logs.length} of ${total.toLocaleString()}`}
            </span>
          </div>
          <button
            onClick={() => fetchLogs(page)}
            className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-bold text-slate-700 flex items-center gap-2 hover:bg-slate-50 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Refresh
          </button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Date &amp; Time</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Performed By</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Action</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Description</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Student</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                <th className="px-6 py-4 border-b border-slate-100" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-400">Loading...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-400">No activity logs yet.</td>
                </tr>
              ) : (
                logs.map((log) => {
                  const { date, time } = formatDate(log.logged_at)
                  const badge = statusBadge(log.action, log.details)
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-800">{date}</div>
                        <div className="text-[12px] text-slate-400">{time}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700">
                            {initials(log.performed_by)}
                          </div>
                          <div className="text-sm font-medium text-slate-800">{log.performed_by}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-on-primary-container">{log.action}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600 truncate max-w-xs">
                          {buildDescription(log.action, log.details)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-data-mono text-slate-600">{log.student_id ?? '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {log.action === 'PAYMENT_RECORDED' && (
                          <button
                            onClick={() => generateReceipt({
                              studentId: log.student_id,
                              studentName: log.student_name,
                              program: log.program,
                              amount: log.details?.amount,
                              paymentMethod: log.details?.payment_method,
                              paymentDate: log.logged_at,
                              referenceNo: log.details?.reference_no,
                              status: log.details?.new_status,
                            })}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
                          >
                            <span className="material-symbols-outlined text-[14px]">download</span>
                            Receipt
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page === 1 || loading}
            className="text-sm text-slate-400 font-bold hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = i + 1
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded text-sm font-bold transition-colors ${
                    page === p ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              )
            })}
            {totalPages > 5 && <span className="text-slate-400">...</span>}
          </div>
          <button
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            disabled={page === totalPages || loading}
            className="text-sm text-slate-600 font-bold hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      <footer className="mt-16 pb-4 text-center text-slate-400 text-[11px] font-medium">
        <p>© 2024 Student Finance Wallet Admin Terminal • All transactions encrypted with 256-bit SSL</p>
      </footer>
    </div>
  )
}
