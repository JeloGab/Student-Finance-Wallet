const express = require('express')
const router = express.Router()
const { authenticate, requireRole } = require('../middleware/auth')
const { lookupStudent, getStudentStatus, getMyAccount, getMyFees, getMyTransactions } = require('../controllers/studentController')

router.get('/me', authenticate, requireRole('student'), getMyAccount)
router.get('/me/fees', authenticate, requireRole('student'), getMyFees)
router.get('/me/transactions', authenticate, requireRole('student'), getMyTransactions)

router.get('/:studentId/status', getStudentStatus)
router.get('/:studentId', authenticate, requireRole('finance_staff'), lookupStudent)

module.exports = router
