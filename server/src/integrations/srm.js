const BASE_URL = process.env.ESB_BASE_URL || 'https://esb-cjnx.onrender.com'

const verifyStudent = async (studentId) => {
  const response = await fetch(`${BASE_URL}/api/esb/srm/students/${studentId}`)

  if (response.status === 404) return null
  if (!response.ok) throw new Error(`ESB/SRM returned ${response.status}`)

  const body = await response.json()

  const student_name = [body.first_name, body.middle_name, body.last_name]
    .filter(Boolean)
    .join(' ')

  return {
    exists: true,
    student_name: student_name || null,
    program: body.course ?? null,
    email: body.email ?? null,
  }
}

module.exports = { verifyStudent }
