const recentTransactions = [
  {
    description: 'Tuition Fee - Semester 1',
    date: 'Oct 12, 2023',
    ref: '#TRX-99421-IAE',
    amount: '₱2,800.00',
    status: 'Cleared',
    statusClass: 'bg-emerald-100 text-on-tertiary-container',
  },
  {
    description: 'Library & Technology Fee',
    date: 'Oct 14, 2023',
    ref: '#TRX-99505-IAE',
    amount: '₱450.00',
    status: 'Cleared',
    statusClass: 'bg-emerald-100 text-on-tertiary-container',
  },
  {
    description: 'Student Health Insurance',
    date: 'Oct 15, 2023',
    ref: '#TRX-99612-IAE',
    amount: '₱250.00',
    status: 'Cleared',
    statusClass: 'bg-emerald-100 text-on-tertiary-container',
  },
]

export default function StudentDashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Academic Ledger Summary</h1>
          <p className="text-on-secondary-container mt-1">Welcome back, Alex. Your account status is currently up to date.</p>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Main Balance Widget */}
        <div className="lg:col-span-12 bg-white rounded-xl border border-slate-200 p-8 relative overflow-hidden" style={{ boxShadow: '0 4px 12px rgba(0, 31, 63, 0.05)' }}>
          <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />
          <div className="flex flex-col md:flex-row justify-between gap-8">
            {/* Left: balance + button */}
            <div className="flex flex-col justify-between space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-on-surface-variant mb-4">Balance Summary</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-primary">₱0.00</span>
                  <span className="text-sm font-semibold text-on-tertiary-container uppercase tracking-widest">Remaining Balance</span>
                </div>
              </div>
              <div className="flex gap-4">
                <button className="border border-slate-200 text-slate-600 px-6 py-2.5 rounded-lg text-[12px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-colors">
                  <span className="material-symbols-outlined text-sm">history</span>
                  Transaction History
                </button>
              </div>
            </div>

            {/* Right: totals + progress */}
            <div className="flex flex-col justify-center space-y-6 md:border-l md:border-slate-100 md:pl-8">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Due</p>
                <p className="text-2xl font-bold text-slate-900">₱3,500.00</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Paid</p>
                <p className="text-2xl font-bold text-on-tertiary-container">₱3,500.00</p>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="lg:col-span-12 bg-white rounded-xl border border-slate-200 overflow-hidden" style={{ boxShadow: '0 4px 12px rgba(0, 31, 63, 0.05)' }}>
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-xl font-bold text-primary">Recent Transactions</h3>
            <button className="text-sm font-semibold text-on-primary-container hover:text-primary transition-colors">View All</button>
          </div>
          <div className="overflow-x-auto">
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
                {recentTransactions.map((tx, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 text-sm">{tx.description}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm">{tx.date}</td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-mono">{tx.ref}</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900 text-sm">{tx.amount}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${tx.statusClass}`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
