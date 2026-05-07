require('dotenv').config()
const express = require('express')
const cors = require('cors')

const authRoutes = require('./src/routes/auth')
const paymentRoutes = require('./src/routes/payments')
const studentRoutes = require('./src/routes/students')
const adminRoutes = require('./src/routes/admin')

const app = express()

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/admin', adminRoutes)

app.get('/health', (req, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`SFW server running on port ${PORT}`))
