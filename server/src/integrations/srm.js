const verifyStudent = async (studentId) => {
  const token = process.env.ESB_JWT_TOKEN
  const baseUrl = process.env.ESB_BASE_URL || 'https://esb-cjnx.onrender.com'

  if (!token) {
    console.warn('[SRM] ESB_JWT_TOKEN not set — skipping SRM verification')
    return { exists: true, student_name: null, program: null, email: null }
  }

  const response = await fetch(`${baseUrl}/api/esb/srm/students/${studentId}`, {
    headers: { Authorization: `Bearer ${token}` }
  })

  if (response.status === 404) return null
  if (!response.ok) throw new Error(`ESB/SRM returned ${response.status}`)

  const body = await response.json()
  // Field names TBD — update mapping once SRM team confirms response shape
  return {
    exists: true,
    student_name: body.full_name ?? body.student_name ?? body.name ?? null,
    program: body.program ?? body.course ?? null,
    email: body.email ?? null,
  }
}

module.exports = { verifyStudent }
