const express = require('express')
const router = express.Router()
const { authenticate, requireRole } = require('../middleware/auth')
const { lookupStudent } = require('../controllers/studentController')

router.get('/:studentId', authenticate, requireRole('finance_staff'), lookupStudent)

module.exports = router
