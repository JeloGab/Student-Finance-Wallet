import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import supabase from '../lib/supabase'

export default function Layout({ children }) {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login')
        return
      }
      setUser(session.user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/login')
      else setUser(session.user)
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  if (!user) return null

  const role = user.user_metadata?.role ?? 'student'

  return (
    <div className="min-h-screen bg-background">
      <Sidebar role={role} />
      <div className="md:ml-64 flex flex-col min-h-screen">
        <TopBar user={user} />
        <main className="p-6 lg:p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
