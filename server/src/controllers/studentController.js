const supabase = require('../config/supabase')
const { verifyStudent } = require('../integrations/srm')

const manilaTime = () => new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().replace('Z', '+08:00')

const lookupStudent = async (req, res) => {
  const { studentId } = req.params

  try {
    const srmData = await verifyStudent(studentId)
    if (!srmData) {
      return res.status(404).json({
        error: 'Student not found',
        message: `Student ID ${studentId} does not exist in SRM`
      })
    }

    let { data } = await supabase
      .from('student_accounts')
      .select('student_id, student_name, program, total_due, total_paid, status')
      .eq('student_id', studentId)
      .single()

    if (!data) {
      const { data: newStudent, error: insertError } = await supabase
        .from('student_accounts')
        .insert({
          student_id: studentId,
          student_name: srmData.student_name,
          program: srmData.program,
          email: srmData.email,
          total_due: 0,
          total_paid: 0,
          status: 'ON_HOLD'
        })
        .select('student_id, student_name, program, total_due, total_paid, status')
        .single()

      if (insertError) throw insertError
      data = newStudent
    }

    const remaining_balance = Number(data.total_due) - Number(data.total_paid)
    return res.json({ ...data, remaining_balance })
  } catch (err) {
    if (err.message?.includes('ESB/SRM')) {
      return res.status(503).json({ error: 'SRM unavailable', message: 'Unable to verify student. Please try again later.' })
    }
    console.error('lookupStudent error:', err)
    return res.status(500).json({ error: 'Server error', message: 'Failed to lookup student' })
  }
}

const updateTotalDue = async (req, res) => {
  const { studentId } = req.params
  const { total_due } = req.body

  const parsed = Number(total_due)
  if (total_due === undefined || isNaN(parsed) || parsed < 0) {
    return res.status(400).json({ error: 'Bad Request', message: 'total_due must be a non-negative number' })
  }

  try {
    const { data: student, error: fetchError } = await supabase
      .from('student_accounts')
      .select('student_id, total_paid, status')
      .eq('student_id', studentId)
      .single()

    if (fetchError || !student) {
      return res.status(404).json({ error: 'Not found', message: `No account found for student ID ${studentId}` })
    }

    const totalPaid = Number(student.total_paid)
    const newStatus = parsed > 0 && totalPaid >= parsed ? 'CLEARED' : 'ON_HOLD'

    const { error: updateError } = await supabase
      .from('student_accounts')
      .update({ total_due: parsed, status: newStatus, updated_at: manilaTime() })
      .eq('student_id', studentId)

    if (updateError) throw updateError

    await supabase.from('activity_logs').insert({
      student_id: studentId,
      action: 'TOTAL_DUE_UPDATED',
      performed_by: req.user.email,
      details: { total_due: parsed, new_status: newStatus },
      logged_at: manilaTime()
    })

    return res.json({
      student_id: studentId,
      total_due: parsed,
      total_paid: totalPaid,
      remaining_balance: parsed - totalPaid,
      status: newStatus
    })
  } catch (err) {
    console.error('updateTotalDue error:', err)
    return res.status(500).json({ error: 'Server error', message: 'Failed to update total due' })
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

module.exports = { lookupStudent, updateTotalDue, getStudentStatus }
