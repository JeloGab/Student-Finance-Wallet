import { useNavigate } from 'react-router-dom'
import supabase from '../lib/supabase'

export default function TopBar({ user }) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <header className="bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 shadow-sm md:ml-64">
      <div className="flex justify-between items-center w-full px-6 py-3">
        <div className="flex items-center space-x-4 flex-1">
          <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
            Student Finance Wallet
          </span>
          <div className="relative w-full max-w-md hidden lg:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              search
            </span>
            <input
              className="w-full bg-surface-container-low border-none rounded-full pl-10 py-1.5 text-sm focus:ring-2 focus:ring-primary-container outline-none"
              placeholder="Global search..."
              type="text"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="w-8 h-8 rounded-full bg-primary text-white text-xs font-bold border border-slate-200 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
          >
            {initials}
          </button>
        </div>
      </div>
    </header>
  )
}
