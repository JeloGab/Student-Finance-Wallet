import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    const redirect = (session) => {
      const role = session.user.user_metadata?.role

      if (role === 'finance_staff') {
        navigate('/finance/payments')
        return
      }

      // Google OAuth users land here with no role — auto-assign student
      if (!role) {
        supabase.auth.updateUser({ data: { role: 'student' } }).then(() => {
          navigate('/dashboard')
        })
        return
      }

      navigate('/dashboard')
    }

    // Listen for the SIGNED_IN event — fires after Supabase finishes
    // the PKCE code exchange from the Google OAuth redirect
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        redirect(session)
      }
      if (event === 'SIGNED_OUT') {
        navigate('/login')
      }
    })

    // Fallback: session already exists if user revisits this route
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (sessionError || !data.session) return
      redirect(data.session)
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  if (error) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center font-manrope">
        <div className="text-center">
          <p className="text-red-500 font-medium mb-2">{error}</p>
          <p className="text-slate-400 text-sm">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center font-manrope">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Completing sign in...</p>
      </div>
    </div>
  )
}
