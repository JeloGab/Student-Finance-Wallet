const express = require('express')
const router = express.Router()
const { authenticate, requireRole } = require('../middleware/auth')
const { lookupStudent, updateTotalDue, getStudentStatus } = require('../controllers/studentController')

router.get('/:studentId/status', getStudentStatus)
router.get('/:studentId', authenticate, requireRole('finance_staff'), lookupStudent)
router.patch('/:studentId/total-due', authenticate, requireRole('finance_staff'), updateTotalDue)

module.exports = router
