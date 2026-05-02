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
      details: { amount, reference_no, payment_method, new_status: newStatus }
    })

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
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    const { data, error } = await supabase
      .from('payment_transactions')
      .select('amount')
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString())
      .eq('status', 'CLEARED')

    if (error) throw error

    const total = data.reduce((sum, p) => sum + Number(p.amount), 0)
    return res.json({ total, date: startOfDay.toISOString().split('T')[0] })
  } catch (err) {
    console.error('getTodayTotal error:', err)
    return res.status(500).json({ error: 'Server error', message: 'Failed to fetch today total' })
  }
}

module.exports = { recordPayment, getRecentPayments, getTodayTotal }
