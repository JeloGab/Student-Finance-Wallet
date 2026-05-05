import { useNavigate } from 'react-router-dom'

const feeItems = [
  {
    icon: 'school',
    iconBg: 'bg-blue-100 text-blue-900',
    category: 'Category: Academic',
    label: 'Tuition (Standard Rate)',
    amount: '₱2,800.00',
  },
  {
    icon: 'science',
    iconBg: 'bg-purple-100 text-purple-900',
    category: 'Category: Facility',
    label: 'Lab Fees (Computer Science Dept)',
    amount: '₱450.00',
  },
  {
    icon: 'payments',
    iconBg: 'bg-emerald-100 text-emerald-900',
    category: 'Category: Other',
    label: 'Miscellaneous Fees',
    amount: '₱250.00',
  },
]

const transactions = [
  {
    date: 'Aug 24, 2024',
    description: 'Fall Semester Registration Fee',
    status: 'Cleared',
    statusClass: 'bg-[#10b98126] text-[#059669]',
    amount: '₱150.00',
  },
  {
    date: 'Sep 02, 2024',
    description: 'Advanced Java Lab Resource Pack',
    status: 'Pending',
    statusClass: 'bg-slate-100 text-slate-500',
    amount: '₱450.00',
  },
  {
    date: 'Sep 15, 2024',
    description: 'Late Enrollment Fee (CSS Adjustment)',
    status: 'Overdue',
    statusClass: 'bg-[#ef44441a] text-[#b91c1c]',
    amount: '₱25.00',
  },
]

export default function StudentBilling() {
  const navigate = useNavigate()

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-on-secondary-container mb-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="hover:text-primary transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to dashboard
        </button>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Billing &amp; Invoicing</h1>
          <p className="text-on-surface-variant mt-1">Semester Fall 2024 • Academic ID: IAE-8842</p>
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

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left column */}
        <div className="lg:col-span-8 space-y-6">

          {/* Statement Breakdown */}
          <div className="bg-white border border-slate-200/50 rounded-xl shadow-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
            <h3 className="text-xl font-bold text-primary mb-6">Statement Breakdown</h3>
            <div className="space-y-4">
              {feeItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.iconBg}`}>
                      <span className="material-symbols-outlined">{item.icon}</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-secondary-container">{item.category}</p>
                      <p className="text-sm font-bold mt-0.5">{item.label}</p>
                    </div>
                  </div>
                  <p className="text-base font-semibold text-primary">{item.amount}</p>
                </div>
              ))}
            </div>

            {/* Summary Footer */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-end gap-2">
              <div className="flex items-center gap-12 text-on-surface-variant">
                <span className="text-sm">Subtotal</span>
                <span className="text-base font-semibold">₱3,500.00</span>
              </div>
              <div className="flex items-center gap-12 text-error font-medium">
                <span className="text-sm">Pending Adjustments</span>
                <span className="text-base font-semibold">-₱200.00</span>
              </div>
              <div className="flex items-center gap-12 mt-2">
                <span className="text-2xl font-bold text-primary">Total Balance</span>
                <span className="text-2xl font-bold text-primary">₱3,300.00</span>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white border border-slate-200/50 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold">Transaction History</h3>
              <button className="text-sm font-semibold text-blue-900 hover:underline">View All Records</button>
            </div>
            <table className="w-full text-left">
              <thead className="bg-white text-on-surface-variant">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Description</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-slate-600">{tx.date}</td>
                    <td className="px-6 py-4 text-sm">{tx.description}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[12px] font-bold ${tx.statusClass}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-right">{tx.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column — Adjustment Notices */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200/50 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-amber-500">campaign</span>
              <h3 className="text-lg font-bold">Adjustment Notices</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-100">
                <p className="text-sm font-bold text-amber-900 mb-1">Course Shifting Update</p>
                <p className="text-sm text-amber-800 leading-relaxed">
                  CSS has confirmed your shift from Data Ethics to CS-402. A credit of ₱200.00 will be applied to your next statement.
                </p>
                <p className="text-[11px] mt-2 text-amber-700/60 font-semibold tracking-wider">REF ID: CSS-4491-01</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-sm font-bold text-primary mb-1">Scholarship Credit</p>
                <p className="text-sm text-on-surface-variant">Academic Excellence credit verified. Status: In-review.</p>
              </div>
            </div>
            <button className="w-full mt-6 text-center text-sm font-bold text-blue-900 py-2 border border-blue-900 rounded-lg hover:bg-blue-50 transition-colors">
              Appeal an Adjustment
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
