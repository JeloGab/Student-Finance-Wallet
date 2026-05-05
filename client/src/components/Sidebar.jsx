import { NavLink } from 'react-router-dom'

const adminNav = [
  { to: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/finance/payments', icon: 'payments', label: 'Payment Management' },
  { to: '/activity', icon: 'history', label: 'Activity Logs' },
]

const studentNav = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/billing', icon: 'receipt_long', label: 'Billing' },
]

const bottomItems = [
  { to: '/settings', icon: 'settings', label: 'Settings' },
  { to: '/support', icon: 'help', label: 'Support' },
]

export default function Sidebar({ role }) {
  const navItems = role === 'finance_staff' ? adminNav : studentNav

  return (
    <aside className="h-screen w-64 border-r border-slate-200 fixed left-0 top-0 hidden md:flex flex-col bg-white z-50">
      <div className="p-6">
        <h2 className="text-xl font-bold text-black mb-1">Student Finance Wallet</h2>
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Academic Ecosystem</p>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm ${
                isActive
                  ? 'bg-slate-50 text-primary font-bold'
                  : 'text-slate-500 hover:bg-slate-50'
              }`
            }
          >
            <span className="material-symbols-outlined">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 space-y-1">
        {bottomItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors text-sm"
          >
            <span className="material-symbols-outlined">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  )
}
