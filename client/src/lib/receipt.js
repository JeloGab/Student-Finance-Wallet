import jsPDF from 'jspdf'

export const generateReceipt = ({ studentId, studentName, program, amount, paymentMethod, paymentDate, referenceNo, status }) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a5' })
  const pageW = doc.internal.pageSize.getWidth()

  const center = (text, y) => {
    doc.text(text, pageW / 2, y, { align: 'center' })
  }

  const line = (y) => {
    doc.setDrawColor(200, 200, 200)
    doc.line(15, y, pageW - 15, y)
  }

  const formatAmount = (val) =>
    `PHP ${Number(val).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })

  const now = new Date().toLocaleString('en-PH', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  // Header
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  center('INTELLIGENT ACADEMIC ECOSYSTEM', 18)

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 31, 63)
  center('Student Finance Wallet', 26)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(80, 80, 80)
  center('OFFICIAL PAYMENT RECEIPT', 33)

  line(37)

  // Reference + Date
  doc.setFontSize(9)
  doc.setTextColor(120, 120, 120)
  doc.text('Reference No.', 15, 44)
  doc.text('Generated', pageW - 15, 44, { align: 'right' })

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 31, 63)
  doc.text(referenceNo, 15, 50)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(80, 80, 80)
  doc.setFontSize(9)
  doc.text(now, pageW - 15, 50, { align: 'right' })

  line(55)

  // Student Info
  doc.setFontSize(8)
  doc.setTextColor(120, 120, 120)
  doc.text('STUDENT INFORMATION', 15, 62)

  doc.setFontSize(10)
  doc.setTextColor(30, 30, 30)
  doc.setFont('helvetica', 'bold')
  doc.text(studentName ?? 'N/A', 15, 69)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(80, 80, 80)
  doc.text(`ID: ${studentId}`, 15, 75)
  doc.text(`Program: ${program ?? 'N/A'}`, 15, 81)

  line(86)

  // Payment Details
  doc.setFontSize(8)
  doc.setTextColor(120, 120, 120)
  doc.text('PAYMENT DETAILS', 15, 93)

  const rows = [
    ['Amount Paid', formatAmount(amount)],
    ['Payment Method', paymentMethod],
    ['Payment Date', formatDate(paymentDate)],
    ['Account Status', status],
  ]

  let y = 100
  rows.forEach(([label, value]) => {
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.setFont('helvetica', 'normal')
    doc.text(label, 15, y)

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(label === 'Amount Paid' ? 0 : 30, label === 'Amount Paid' ? 31 : 30, label === 'Amount Paid' ? 63 : 30)
    doc.setFontSize(10)
    doc.text(value, pageW - 15, y, { align: 'right' })
    y += 9
  })

  line(y + 2)

  // Status badge area
  const statusColor = status === 'CLEARED' ? [16, 185, 129] : [100, 116, 139]
  doc.setFillColor(...statusColor)
  doc.roundedRect(pageW / 2 - 20, y + 6, 40, 10, 2, 2, 'F')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  center(status, y + 12.5)

  // Footer
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(150, 150, 150)
  center('This is an official receipt issued by the Student Finance Wallet.', y + 26)
  center('Please keep this for your records.', y + 31)

  doc.save(`receipt-${referenceNo}.pdf`)
}
