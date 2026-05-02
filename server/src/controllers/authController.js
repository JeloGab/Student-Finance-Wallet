const { authClient } = require('../middleware/auth')

const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Bad Request', message: 'Email and password are required' })
  }

  const { data, error } = await authClient.auth.signInWithPassword({ email, password })

  if (error || !data.session) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid email or password' })
  }

  return res.json({
    access_token: data.session.access_token,
    role: data.user.user_metadata?.role ?? null
  })
}

module.exports = { login }
