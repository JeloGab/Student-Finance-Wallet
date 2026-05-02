const { createClient } = require('@supabase/supabase-js')

const authClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized', message: 'No token provided' })
  }

  const { data: { user }, error } = await authClient.auth.getUser(token)

  if (error || !user) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' })
  }

  req.user = user
  req.role = user.user_metadata?.role
  next()
}

const requireRole = (role) => (req, res, next) => {
  if (req.role !== role) {
    return res.status(403).json({ error: 'Forbidden', message: `Access requires ${role} role` })
  }
  next()
}

module.exports = { authenticate, requireRole, authClient }
