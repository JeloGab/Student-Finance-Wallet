const express = require('express')
const router = express.Router()
const { authenticate, requireRole } = require('../middleware/auth')
const validate = require('../middleware/validate')
const { paymentSchema } = require('../validators/paymentValidator')
const { recordPayment, getRecentPayments, getTodayTotal, exportPayments } = require('../controllers/paymentController')

router.post('/', authenticate, requireRole('finance_staff'), validate(paymentSchema), recordPayment)
router.get('/recent', authenticate, requireRole('finance_staff'), getRecentPayments)
router.get('/today-total', authenticate, requireRole('finance_staff'), getTodayTotal)
router.get('/export', authenticate, requireRole('finance_staff'), exportPayments)

module.exports = router
