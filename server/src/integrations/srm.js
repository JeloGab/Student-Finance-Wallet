const verifyStudent = async (studentId) => {
  const token = process.env.ESB_JWT_TOKEN
  const baseUrl = process.env.ESB_BASE_URL || 'https://esb-cjnx.onrender.com'

  if (!token) {
    console.warn('[SRM] ESB_JWT_TOKEN not set — skipping SRM verification')
    return true
  }

  const response = await fetch(`${baseUrl}/api/esb/srm/students/${studentId}`, {
    headers: { Authorization: `Bearer ${token}` }
  })

  if (response.ok) return true
  if (response.status === 404) return false
  throw new Error(`ESB/SRM returned ${response.status}`)
}

module.exports = { verifyStudent }
