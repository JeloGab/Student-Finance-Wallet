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
    <header className="border-b border-slate-200 bg-white">
      <div className="flex justify-end items-center px-6 py-3 gap-3">
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
    </header>
  )
}
