const supabase = require('../config/supabase')
const { verifyStudent } = require('../integrations/srm')

const lookupStudent = async (req, res) => {
  const { studentId } = req.params

  try {
    // Step 1: Verify student exists in SRM via ESB
    const existsInSRM = await verifyStudent(studentId)
    if (!existsInSRM) {
      return res.status(404).json({
        error: 'Student not found',
        message: `Student ID ${studentId} does not exist in SRM`
      })
    }

    // Step 2: Check our DB
    const { data } = await supabase
      .from('student_accounts')
      .select('student_id, student_name, program, total_due, total_paid, status')
      .eq('student_id', studentId)
      .single()

    // Step 3: Auto-create if SRM confirmed but not in our DB yet
    if (!data) {
      const { data: newStudent, error: insertError } = await supabase
        .from('student_accounts')
        .insert({
          student_id: studentId,
          student_name: null,
          program: null,
          total_due: 0,
          total_paid: 0,
          status: 'ON_HOLD'
        })
        .select('student_id, student_name, program, total_due, total_paid, status')
        .single()

      if (insertError) throw insertError
      return res.json(newStudent)
    }

    return res.json(data)
  } catch (err) {
    if (err.message?.includes('ESB/SRM')) {
      return res.status(503).json({ error: 'SRM unavailable', message: 'Unable to verify student. Please try again later.' })
    }
    console.error('lookupStudent error:', err)
    return res.status(500).json({ error: 'Server error', message: 'Failed to lookup student' })
  }
}

const getStudentStatus = async (req, res) => {
  const { studentId } = req.params

  try {
    const { data, error } = await supabase
      .from('student_accounts')
      .select('student_id, status')
      .eq('student_id', studentId)
      .single()

    if (error || !data) {
      return res.status(404).json({ error: 'Student not found', message: `No account found for student ID ${studentId}` })
    }

    return res.json({ student_id: data.student_id, status: data.status })
  } catch (err) {
    console.error('getStudentStatus error:', err)
    return res.status(500).json({ error: 'Server error', message: 'Failed to get student status' })
  }
}

const getMyAccount = async (req, res) => {
  const email = req.user.email

  try {
    const { data, error } = await supabase
      .from('student_accounts')
      .select('student_id, student_name, program, total_due, total_paid, status')
      .eq('email', email)
      .single()

    if (error || !data) {
      return res.status(404).json({ error: 'Not found', message: 'No student account linked to this email' })
    }

    const remaining_balance = Number(data.total_due) - Number(data.total_paid)
    return res.json({ ...data, remaining_balance })
  } catch (err) {
    console.error('getMyAccount error:', err)
    return res.status(500).json({ error: 'Server error', message: 'Failed to fetch account' })
  }
}

const getMyFees = async (req, res) => {
  const email = req.user.email
  const { semester } = req.query

  try {
    const { data: account, error: accountError } = await supabase
      .from('student_accounts')
      .select('student_id')
      .eq('email', email)
      .single()

    if (accountError || !account) {
      return res.status(404).json({ error: 'Not found', message: 'No student account linked to this email' })
    }

    let query = supabase
      .from('enrollment_fees')
      .select('id, course_id, course_code, course_name, units, amount, fee_type, semester')
      .eq('student_id', account.student_id)
      .order('created_at', { ascending: true })

    if (semester) query = query.eq('semester', semester)

    const { data, error } = await query
    if (error) throw error

    return res.json(data)
  } catch (err) {
    console.error('getMyFees error:', err)
    return res.status(500).json({ error: 'Server error', message: 'Failed to fetch fees' })
  }
}

const getMyTransactions = async (req, res) => {
  const email = req.user.email

  try {
    const { data: account, error: accountError } = await supabase
      .from('student_accounts')
      .select('student_id')
      .eq('email', email)
      .single()

    if (accountError || !account) {
      return res.status(404).json({ error: 'Not found', message: 'No student account linked to this email' })
    }

    const { data, error } = await supabase
      .from('payment_transactions')
      .select('id, reference_no, amount, payment_date, payment_method, status, created_at')
      .eq('student_id', account.student_id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return res.json(data)
  } catch (err) {
    console.error('getMyTransactions error:', err)
    return res.status(500).json({ error: 'Server error', message: 'Failed to fetch transactions' })
  }
}

module.exports = { lookupStudent, getStudentStatus, getMyAccount, getMyFees, getMyTransactions }
