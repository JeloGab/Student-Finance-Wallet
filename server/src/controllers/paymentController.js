const supabase = require('../config/supabase')

const recordPayment = async (req, res) => {
  const { student_id, amount, payment_date, reference_no, payment_method } = req.body
  const recorded_by = req.user.email

  try {
    const { data: student, error: studentError } = await supabase
      .from('student_accounts')
      .select('student_id, total_due, total_paid')
      .eq('student_id', student_id)
      .single()

    if (studentError || !student) {
      return res.status(404).json({
        error: 'Student not found',
        message: `No account found for student ID ${student_id}`
      })
    }

    const { data: existing } = await supabase
      .from('payment_transactions')
      .select('id')
      .eq('reference_no', reference_no)
      .maybeSingle()

    if (existing) {
      return res.status(409).json({
        error: 'Duplicate Payment',
        message: 'This transaction reference has already been recorded'
      })
    }

    const { error: insertError } = await supabase
      .from('payment_transactions')
      .insert({
        student_id,
        amount,
        payment_date,
        reference_no,
        payment_method,
        recorded_by,
        status: 'CLEARED'
      })

    if (insertError) throw insertError

    const newTotalPaid = Number(student.total_paid) + Number(amount)
    const totalDue = Number(student.total_due)
    const newStatus = totalDue > 0 && newTotalPaid >= totalDue ? 'CLEARED' : 'ON_HOLD'

    const { error: updateError } = await supabase
      .from('student_accounts')
      .update({ total_paid: newTotalPaid, status: newStatus, updated_at: new Date().toISOString() })
      .eq('student_id', student_id)

    if (updateError) {
      console.error('CRITICAL: payment inserted but balance update failed for student', student_id, updateError)
      throw updateError
    }

    await supabase.from('activity_logs').insert({
      student_id,
      action: 'PAYMENT_RECORDED',
      performed_by: recorded_by,
      details: { amount, reference_no, payment_method, new_status: newStatus },
      logged_at: new Date().toISOString()
    })

    const timestamp = new Date().toISOString()
    const remainingBalance = totalDue - newTotalPaid

    await supabase.from('payment_notifications').insert({
      event: 'PAYMENT_RECORDED',
      student_id,
      payload: {
        event: 'PAYMENT_RECORDED',
        student_id,
        amount: Number(amount),
        reference_no,
        payment_method,
        payment_date,
        new_status: newStatus,
        total_due: totalDue,
        total_paid: newTotalPaid,
        remaining_balance: remainingBalance,
        timestamp
      }
    })

    if (newStatus !== student.status) {
      await supabase.from('payment_notifications').insert({
        event: 'STATUS_CHANGED',
        student_id,
        payload: {
          event: 'STATUS_CHANGED',
          student_id,
          previous_status: student.status,
          new_status: newStatus,
          timestamp
        }
      })
    }

    return res.status(201).json({
      message: 'Payment recorded successfully',
      student_status: newStatus
    })
  } catch (err) {
    console.error('recordPayment error:', err)
    return res.status(500).json({ error: 'Server error', message: 'Failed to record payment' })
  }
}

const getRecentPayments = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('payment_transactions')
      .select(`
        id,
        reference_no,
        student_id,
        amount,
        payment_date,
        payment_method,
        status,
        created_at,
        student_accounts (student_name)
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error

    return res.json(data)
  } catch (err) {
    console.error('getRecentPayments error:', err)
    return res.status(500).json({ error: 'Server error', message: 'Failed to fetch recent payments' })
  }
}

const getTodayTotal = async (req, res) => {
  try {
    // Use PHT (UTC+8) to determine today's date boundaries
    const PHT_OFFSET = 8 * 60 * 60 * 1000
    const nowPHT = new Date(Date.now() + PHT_OFFSET)
    const datePHT = nowPHT.toISOString().split('T')[0]
    const startOfDay = new Date(`${datePHT}T00:00:00+08:00`)
    const endOfDay = new Date(`${datePHT}T23:59:59+08:00`)

    const { data, error } = await supabase
      .from('payment_transactions')
      .select('amount')
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString())
      .eq('status', 'CLEARED')

    if (error) throw error

    const total = data.reduce((sum, p) => sum + Number(p.amount), 0)
    return res.json({ total, count: data.length, date: startOfDay.toISOString().split('T')[0] })
  } catch (err) {
    console.error('getTodayTotal error:', err)
    return res.status(500).json({ error: 'Server error', message: 'Failed to fetch today total' })
  }
}

const exportPayments = async (req, res) => {
  try {
    let query = supabase
      .from('payment_transactions')
      .select(`
        reference_no,
        student_id,
        amount,
        payment_method,
        payment_date,
        status,
        created_at,
        recorded_by,
        student_accounts (student_name, program)
      `)
      .order('created_at', { ascending: false })

    if (req.query.today === 'true') {
      const PHT_OFFSET = 8 * 60 * 60 * 1000
      const nowPHT = new Date(Date.now() + PHT_OFFSET)
      const datePHT = nowPHT.toISOString().split('T')[0]
      query = query
        .gte('created_at', new Date(`${datePHT}T00:00:00+08:00`).toISOString())
        .lte('created_at', new Date(`${datePHT}T23:59:59+08:00`).toISOString())
    }

    const { data, error } = await query

    if (error) throw error

    const headers = ['Reference No', 'Student ID', 'Student Name', 'Program', 'Amount', 'Payment Method', 'Payment Date', 'Status', 'Recorded By', 'Recorded At']

    const rows = data.map(p => [
      p.reference_no,
      p.student_id,
      p.student_accounts?.student_name ?? '',
      p.student_accounts?.program ?? '',
      Number(p.amount).toFixed(2),
      p.payment_method,
      p.payment_date ?? '',
      p.status,
      p.recorded_by ?? '',
      p.created_at ? new Date(p.created_at).toLocaleString('en-PH') : '',
    ])

    const escape = (val) => `"${String(val).replace(/"/g, '""')}"`
    const csv = [headers, ...rows].map(row => row.map(escape).join(',')).join('\r\n')

    const dateStr = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().split('T')[0]
    const filename = req.query.today === 'true'
      ? `daily-report-${dateStr}.csv`
      : `payments-export-${dateStr}.csv`
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    return res.send(csv)
  } catch (err) {
    console.error('exportPayments error:', err)
    return res.status(500).json({ error: 'Server error', message: 'Failed to export payments' })
  }
}

const getNotifications = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('payment_notifications')
      .select('id, event, payload, created_at')
      .order('created_at', { ascending: false })

    if (error) throw error

    return res.json(data)
  } catch (err) {
    console.error('getNotifications error:', err)
    return res.status(500).json({ error: 'Server error', message: 'Failed to fetch notifications' })
  }
}

const getNotificationsByStudent = async (req, res) => {
  const { studentId } = req.params

  try {
    const { data, error } = await supabase
      .from('payment_notifications')
      .select('id, event, payload, created_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return res.json(data)
  } catch (err) {
    console.error('getNotificationsByStudent error:', err)
    return res.status(500).json({ error: 'Server error', message: 'Failed to fetch notifications' })
  }
}

module.exports = { recordPayment, getRecentPayments, getTodayTotal, exportPayments, getNotifications, getNotificationsByStudent }
