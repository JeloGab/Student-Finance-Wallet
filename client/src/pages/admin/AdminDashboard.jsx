const barData = [
  { day: 'MON', forecast: 40, actual: 80 },
  { day: 'TUE', forecast: 60, actual: 70 },
  { day: 'WED', forecast: 80, actual: 90 },
  { day: 'THU', forecast: 70, actual: 60 },
  { day: 'FRI', forecast: 90, actual: 85 },
  { day: 'SAT', forecast: 50, actual: 40 },
  { day: 'SUN', forecast: 65, actual: 55 },
]

const transactions = [
  {
    initials: 'JD',
    name: 'John Doe (Student)',
    id: '#STU-99812',
    event: 'Tuition Installment',
    amount: '₱45,000.00',
    time: '2 mins ago',
    status: 'Cleared',
    statusClass: 'bg-emerald-100 text-emerald-700',
  },
  {
    initials: 'AS',
    name: 'Alice Smith (Student)',
    id: '#STU-99815',
    event: 'Lab Fees Refund',
    amount: '₱1,250.00',
    time: '14 mins ago',
    status: 'Pending',
    statusClass: 'bg-slate-100 text-slate-700',
  },
  {
    initials: null,
    name: 'System Kernel',
    id: 'Security Override',
    event: 'Batch Reconciliation Failure',
    amount: '—',
    time: '45 mins ago',
    status: 'Escalated',
    statusClass: 'bg-red-100 text-red-700',
    isSystem: true,
  },
]

export default function AdminDashboard() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-primary mb-1">System Dashboard</h2>
          <p className="text-slate-500">Overview of student financial flows and system health.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50">
          <span className="material-symbols-outlined text-lg">calendar_today</span>
          Last 30 Days
        </button>
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
              <span className="text-emerald-600 text-[10px] font-bold bg-emerald-50 px-2 py-1 rounded">+12.5%</span>
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Total Collections</p>
            <h3 className="text-4xl font-extrabold text-primary mb-4">₱4.2M</h3>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: '75%' }} />
            </div>
            <p className="mt-2 text-[11px] text-slate-400 font-medium">75% of semester target reached</p>
          </div>

          {/* Pending Approvals Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-400" />
            <div className="flex justify-between items-start mb-6">
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="material-symbols-outlined text-slate-600">pending_actions</span>
              </div>
              <span className="text-slate-500 text-[10px] font-bold bg-slate-100 px-2 py-1 rounded">Urgent</span>
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Pending Approvals</p>
            <h3 className="text-4xl font-extrabold text-slate-800 mb-4">12</h3>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700">JD</div>
                <div className="w-7 h-7 rounded-full border-2 border-white bg-green-100 flex items-center justify-center text-[10px] font-bold text-green-700">AS</div>
                <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">+10</div>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Verification required</span>
            </div>
          </div>
        </div>

        {/* Collection Trends Chart */}
        <div className="col-span-12 lg:col-span-8 bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-xl font-bold text-primary">Collection Trends</h3>
              <p className="text-sm text-slate-500">Weekly revenue distribution vs historical average</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-primary inline-block" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Actual</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-slate-200 inline-block" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Forecast</span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex items-end gap-4 mb-6 px-2 min-h-[240px]">
            {barData.map(({ day, forecast, actual }) => (
              <div key={day} className="flex-1 h-full flex flex-col justify-end gap-1">
                <div
                  className="w-full bg-slate-100 rounded-t-lg relative group transition-all hover:bg-slate-200"
                  style={{ height: `${forecast}%` }}
                >
                  <div
                    className="absolute bottom-0 w-full bg-primary rounded-t-lg"
                    style={{ height: `${actual}%` }}
                  />
                </div>
                <span className="text-[10px] text-center font-bold text-slate-400 mt-2">{day}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-8 border-t border-slate-100">
            <button className="flex items-center justify-center gap-3 py-3.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-bold text-primary text-sm">
              <span className="material-symbols-outlined">description</span>
              Export Daily Report
            </button>
            <button className="flex items-center justify-center gap-3 py-3.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-bold text-primary text-sm">
              <span className="material-symbols-outlined">fact_check</span>
              Bulk Verify Payments
            </button>
          </div>
        </div>

        {/* Critical Events Table */}
        <div className="col-span-12 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-xl font-bold text-primary">Critical Events &amp; Transactions</h3>
            <button className="text-sm font-bold text-primary hover:underline">View Full Audit Log</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entity</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Event Type</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx, i) => (
                  <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        {tx.isSystem ? (
                          <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                            <span className="material-symbols-outlined text-sm">report</span>
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                            {tx.initials}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-slate-800">{tx.name}</p>
                          <p className="text-[11px] text-slate-400">{tx.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <span className="text-sm font-medium">{tx.event}</span>
                    </td>
                    <td className="px-8 py-4 font-semibold text-primary">{tx.amount}</td>
                    <td className="px-8 py-4 text-sm text-slate-500">{tx.time}</td>
                    <td className="px-8 py-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${tx.statusClass}`}>
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

      <footer className="mt-16 pb-4 text-center text-slate-400 text-[11px] font-medium">
        <p>© 2024 Student Finance Wallet Admin Terminal • All transactions encrypted with 256-bit SSL</p>
      </footer>
    </div>
  )
}
