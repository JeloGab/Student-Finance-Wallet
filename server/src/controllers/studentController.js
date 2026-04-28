const supabase = require('../config/supabase')

const lookupStudent = async (req, res) => {
  const { studentId } = req.params

  try {
    const { data, error } = await supabase
      .from('student_accounts')
      .select('student_id, student_name, program, total_due, total_paid, status')
      .eq('student_id', studentId)
      .single()

    if (error || !data) {
      return res.status(404).json({
        error: 'Student not found',
        message: `No account found for student ID ${studentId}`
      })
    }

    return res.json(data)
  } catch (err) {
    console.error('lookupStudent error:', err)
    return res.status(500).json({ error: 'Server error', message: 'Failed to lookup student' })
  }
}

module.exports = { lookupStudent }
