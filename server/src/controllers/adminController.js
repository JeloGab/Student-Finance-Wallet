const supabase = require('../config/supabase')

const getDashboardStats = async (req, res) => {
  try {
    const [paymentsResult, accountsResult] = await Promise.all([
      supabase
        .from('payment_transactions')
        .select('amount, created_at, reference_no, student_id, payment_method, status')
        .eq('status', 'CLEARED')
        .order('created_at', { ascending: false }),
      supabase
        .from('student_accounts')
        .select('student_id, student_name, status')
    ])

    if (paymentsResult.error) throw paymentsResult.error
    if (accountsResult.error) throw accountsResult.error

    const payments = paymentsResult.data
    const accounts = accountsResult.data

    const total_collections = payments.reduce((sum, p) => sum + Number(p.amount), 0)
    const on_hold_count = accounts.filter(a => a.status === 'ON_HOLD').length
    const cleared_count = accounts.filter(a => a.status === 'CLEARED').length

    // Last 7 days daily totals
    const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    const today = new Date()
    const weekly = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const dayLabel = DAY_LABELS[date.getDay()]

      const dayTotal = payments
        .filter(p => p.created_at.startsWith(dateStr))
        .reduce((sum, p) => sum + Number(p.amount), 0)

      weekly.push({ day: dayLabel, total: dayTotal })
    }

    const maxTotal = Math.max(...weekly.map(w => w.total), 1)
    const weekly_totals = weekly.map(w => ({
      day: w.day,
      total: w.total,
      pct: Math.max(Math.round((w.total / maxTotal) * 100), 4)
    }))

    // Recent 5 transactions with student name
    const recent_transactions = payments.slice(0, 5).map(p => {
      const account = accounts.find(a => a.student_id === p.student_id)
      return {
        student_id: p.student_id,
        student_name: account?.student_name || null,
        reference_no: p.reference_no,
        payment_method: p.payment_method,
        amount: Number(p.amount),
        created_at: p.created_at,
        status: p.status
      }
    })

    return res.json({
      total_collections,
      on_hold_count,
      cleared_count,
      weekly_totals,
      recent_transactions
    })
  } catch (err) {
    console.error('getDashboardStats error:', err)
    return res.status(500).json({ error: 'Server error', message: 'Failed to fetch dashboard stats' })
  }
}

const getActivityLogs = async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1)
  const limit = 15
  const offset = (page - 1) * limit

  try {
    const [logsResult, countResult] = await Promise.all([
      supabase
        .from('activity_logs')
        .select('id, student_id, action, performed_by, details, logged_at')
        .order('logged_at', { ascending: false })
        .range(offset, offset + limit - 1),
      supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
    ])

    if (logsResult.error) throw logsResult.error
    if (countResult.error) throw countResult.error

    const total = countResult.count ?? 0

    // Stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const [todayResult, weekResult, staffResult] = await Promise.all([
      supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .gte('logged_at', today.toISOString()),
      supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .gte('logged_at', weekAgo.toISOString()),
      supabase
        .from('activity_logs')
        .select('performed_by')
    ])

    const unique_staff = staffResult.data
      ? new Set(staffResult.data.map(r => r.performed_by)).size
      : 0

    return res.json({
      logs: logsResult.data,
      total,
      page,
      total_pages: Math.ceil(total / limit),
      stats: {
        total_logs: total,
        today_count: todayResult.count ?? 0,
        week_count: weekResult.count ?? 0,
        unique_staff
      }
    })
  } catch (err) {
    console.error('getActivityLogs error:', err)
    return res.status(500).json({ error: 'Server error', message: 'Failed to fetch activity logs' })
  }
}

module.exports = { getDashboardStats, getActivityLogs }
