import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../lib/supabase'

export default function TopBar({ user }) {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="flex justify-end items-center px-6 py-3 gap-3">
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            title="Sign out"
            className="w-8 h-8 rounded-full bg-primary text-white text-xs font-bold border border-slate-200 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
          >
            {initials}
          </button>
        </div>
      </header>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-primary">logout</span>
              <h2 className="text-lg font-bold text-slate-900">Sign out</h2>
            </div>
            <p className="text-sm text-slate-500 mb-6">Are you sure you want to sign out of your account?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:opacity-90 transition-opacity"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
