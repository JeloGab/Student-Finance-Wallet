const { z } = require('zod')

const paymentSchema = z.object({
  student_id: z.string().min(1, 'Student ID is required'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  payment_date: z.string().min(1, 'Payment date is required'),
  reference_no: z.string().min(1, 'Reference number is required'),
  payment_method: z.enum(['GCASH', 'MAYA', 'ONLINE_BANK', 'MANUAL'], {
    errorMap: () => ({ message: 'Invalid payment method selected' })
  })
})

module.exports = { paymentSchema }
