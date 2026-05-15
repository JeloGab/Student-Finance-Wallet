import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import supabase from '../lib/supabase'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          role: 'finance_staff',
        },
      },
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center font-manrope">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-blue-900">Student Finance Wallet</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Academic Ecosystem</p>
        </div>

        <h2 className="font-h2 text-h2 text-slate-900 mb-6">Create Account</h2>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-lg mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-label-bold font-label-bold text-slate-600 block uppercase">Full Name</label>
            <input
              name="fullName"
              type="text"
              value={form.fullName}
              onChange={handleChange}
              required
              placeholder="Juan dela Cruz"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-container outline-none text-body-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-label-bold font-label-bold text-slate-600 block uppercase">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-container outline-none text-body-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-label-bold font-label-bold text-slate-600 block uppercase">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="At least 6 characters"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-container outline-none text-body-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-body-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
