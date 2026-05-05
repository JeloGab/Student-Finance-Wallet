const stats = [
  {
    label: 'TOTAL LOGS',
    value: '12,842',
    icon: 'database',
    iconClass: 'text-on-primary-container',
    sub: '+234 this week',
    subClass: 'text-on-tertiary-container',
    subIcon: 'trending_up',
  },
  {
    label: 'FAILED ATTEMPTS',
    value: '3',
    icon: 'gpp_maybe',
    iconClass: 'text-error',
    sub: 'Last failure: 2h ago',
    subClass: 'text-on-surface-variant',
    subIcon: null,
  },
  {
    label: 'ADMIN ACTIONS',
    value: '45',
    icon: 'admin_panel_settings',
    iconClass: 'text-on-secondary-container',
    sub: 'Requires 2FA verification',
    subClass: 'text-on-surface-variant',
    subIcon: null,
  },
  {
    label: 'AVG DURATION',
    value: '12.4s',
    icon: 'timer',
    iconClass: 'text-on-primary-container',
    sub: 'System healthy',
    subClass: 'text-on-tertiary-container',
    subIcon: 'check_circle',
  },
]

const logs = [
  {
    date: 'Oct 24, 2023',
    time: '14:32:01 PM',
    initials: 'MS',
    initialsClass: 'bg-blue-100 text-blue-700',
    user: 'Marcus Sterling',
    action: 'TUITION_PAYMENT',
    description: 'Processed payment for Semester 1 (Spring 2024) via ACH Transfer.',
    status: 'CLEARED',
    statusClass: 'bg-emerald-100 text-emerald-700',
  },
  {
    date: 'Oct 24, 2023',
    time: '11:15:44 AM',
    initials: 'SYS',
    initialsClass: 'bg-slate-100 text-slate-700',
    user: 'System Automator',
    action: 'RECURRING_BILL',
    description: 'Monthly Campus Housing Fee adjustment generated automatically.',
    status: 'PENDING',
    statusClass: 'bg-slate-100 text-slate-700',
  },
  {
    date: 'Oct 23, 2023',
    time: '16:05:22 PM',
    initials: 'ADM',
    initialsClass: 'bg-slate-100 text-slate-700',
    user: 'Admin Portal',
    action: 'ACCOUNT_LOCK',
    description: 'Security lock applied after 3 failed login attempts from unknown IP.',
    status: 'OVERDUE',
    statusClass: 'bg-red-100 text-red-700',
  },
  {
    date: 'Oct 23, 2023',
    time: '09:40:11 AM',
    initials: 'MS',
    initialsClass: 'bg-blue-100 text-blue-700',
    user: 'Marcus Sterling',
    action: 'PROFILE_UPDATE',
    description: 'Primary contact email changed to university address.',
    status: 'CLEARED',
    statusClass: 'bg-emerald-100 text-emerald-700',
  },
  {
    date: 'Oct 22, 2023',
    time: '13:21:55 PM',
    initials: 'SYS',
    initialsClass: 'bg-slate-100 text-slate-700',
    user: 'System Automator',
    action: 'TOKEN_REFRESH',
    description: 'Security session token refreshed for mobile banking app.',
    status: 'CLEARED',
    statusClass: 'bg-emerald-100 text-emerald-700',
  },
]

export default function ActivityLogs() {
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
        {stats.map((s) => (
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
            <button className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-bold text-slate-700 flex items-center gap-2 hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Filters
            </button>
            <div className="h-6 w-px bg-slate-200 mx-2" />
            <span className="text-sm text-slate-500">Showing 1–15 of 12,842</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
              <span className="text-slate-500">Status:</span>
              <select className="bg-transparent border-none p-0 focus:ring-0 font-bold text-slate-700 cursor-pointer outline-none text-sm">
                <option>All</option>
                <option>Cleared</option>
                <option>Pending</option>
                <option>Overdue</option>
              </select>
            </div>
            <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
              <span className="text-slate-500">Date:</span>
              <select className="bg-transparent border-none p-0 focus:ring-0 font-bold text-slate-700 cursor-pointer outline-none text-sm">
                <option>Last 30 Days</option>
                <option>Last 7 Days</option>
                <option>This Semester</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Date &amp; Time</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">User</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Action</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Description</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                <th className="px-6 py-4 border-b border-slate-100" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.map((log, i) => (
                <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-slate-800">{log.date}</div>
                    <div className="text-[12px] text-slate-400">{log.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${log.initialsClass}`}>
                        {log.initials}
                      </div>
                      <div className="text-sm font-medium text-slate-800">{log.user}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-on-primary-container">{log.action}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600 truncate max-w-xs">{log.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${log.statusClass}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-[20px]">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          <button className="text-sm text-slate-400 font-bold hover:text-primary disabled:opacity-50" disabled>
            Previous
          </button>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded bg-primary text-white text-sm font-bold">1</button>
            <button className="w-8 h-8 rounded text-slate-600 hover:bg-slate-100 text-sm">2</button>
            <button className="w-8 h-8 rounded text-slate-600 hover:bg-slate-100 text-sm">3</button>
            <span className="text-slate-400">...</span>
            <button className="w-8 h-8 rounded text-slate-600 hover:bg-slate-100 text-sm">128</button>
          </div>
          <button className="text-sm text-slate-600 font-bold hover:text-primary">
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
