const express = require('express')
const router = express.Router()
const { authenticate, requireRole } = require('../middleware/auth')
const { getDashboardStats, getActivityLogs } = require('../controllers/adminController')

router.get('/dashboard', authenticate, requireRole('finance_staff'), getDashboardStats)
router.get('/activity-logs', authenticate, requireRole('finance_staff'), getActivityLogs)

module.exports = router
