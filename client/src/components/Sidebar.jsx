import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/finance/payments', icon: 'payments', label: 'Payment Management' },
  { to: '/activity', icon: 'history', label: 'Activity Logs' },
]

const bottomItems = [
  { to: '/settings', icon: 'settings', label: 'Settings' },
  { to: '/support', icon: 'help', label: 'Support' },
]

export default function Sidebar() {
  return (
    <aside className="h-screen w-64 border-r fixed left-0 top-0 hidden md:flex flex-col bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-manrope text-sm font-medium z-50">
      <div className="flex flex-col p-6 flex-1">
        <div className="text-xl font-bold text-blue-900 dark:text-white mb-1">
          Student Finance Wallet
        </div>
        <div className="text-xs text-slate-500 mb-8 uppercase tracking-widest">
          Academic Ecosystem
        </div>

        <nav className="space-y-2">
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-900 text-blue-900 dark:text-blue-400 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                }`
              }
            >
              <span className="material-symbols-outlined">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-6 space-y-2 border-t border-slate-100 dark:border-slate-900">
        {bottomItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className="flex items-center space-x-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-all rounded-lg"
          >
            <span className="material-symbols-outlined">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  )
}
