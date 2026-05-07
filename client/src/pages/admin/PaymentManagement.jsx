import { useState, useEffect, useCallback } from 'react'
import api from '../../lib/api'

const PAYMENT_METHODS = [
  { value: 'GCASH', label: 'GCash' },
  { value: 'MAYA', label: 'Maya' },
  { value: 'ONLINE_BANK', label: 'Online Bank' },
  { value: 'MANUAL', label: 'Manual Payment' },
]

const initialForm = {
  studentId: '',
  amount: '',
  date: '',
  referenceNo: '',
  paymentMethod: 'GCASH',
}

const makeRow = () => ({
  _id: Math.random().toString(36).slice(2),
  studentId: '',
  amount: '',
  date: '',
  referenceNo: '',
  paymentMethod: 'GCASH',
  verified: null,
  verifyError: '',
  verifying: false,
  rowStatus: 'idle',
  rowMsg: '',
})

export default function PaymentManagement() {
  const [form, setForm] = useState(initialForm)
  const [verifiedStudent, setVerifiedStudent] = useState(null)
  const [lookupError, setLookupError] = useState('')
  const [isLooking, setIsLooking] = useState(false)

  const [recentPayments, setRecentPayments] = useState([])
  const [todayTotal, setTodayTotal] = useState(0)
  const [todayCount, setTodayCount] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState(null)

  // Batch modal state
  const [batchOpen, setBatchOpen] = useState(false)
  const [batchRows, setBatchRows] = useState([makeRow()])
  const [batchSubmitting, setBatchSubmitting] = useState(false)
  const [batchDone, setBatchDone] = useState(false)

  useEffect(() => {
    fetchRecentPayments()
    fetchTodayTotal()
  }, [])

  const fetchRecentPayments = async () => {
    try {
      const { data } = await api.get('/api/payments/recent')
      setRecentPayments(data)
    } catch {
      // silent
    }
  }

  const fetchTodayTotal = async () => {
    try {
      const { data } = await api.get('/api/payments/today-total')
      setTodayTotal(data.total)
      setTodayCount(data.count)
    } catch {
      // silent
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (name === 'studentId') {
      setVerifiedStudent(null)
      setLookupError('')
    }
  }

  const lookupStudent = async () => {
    if (!form.studentId.trim()) return
    setIsLooking(true)
    setVerifiedStudent(null)
    setLookupError('')
    try {
      const { data } = await api.get(`/api/students/${form.studentId.trim()}`)
      setVerifiedStudent(data)
    } catch (err) {
      setLookupError(err.response?.data?.message || 'Student not found')
    } finally {
      setIsLooking(false)
    }
  }

  const handleStudentKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      lookupStudent()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!verifiedStudent) {
      setSubmitMessage({ type: 'error', text: 'Please verify the student ID first.' })
      return
    }
    setIsSubmitting(true)
    setSubmitMessage(null)
    try {
      const { data } = await api.post('/api/payments', {
        student_id: form.studentId.trim(),
        amount: parseFloat(form.amount),
        payment_date: form.date,
        reference_no: form.referenceNo.trim(),
        payment_method: form.paymentMethod,
      })
      setSubmitMessage({ type: 'success', text: `Payment recorded. Student status: ${data.student_status}` })
      setForm(initialForm)
      setVerifiedStudent(null)
      fetchRecentPayments()
      fetchTodayTotal()
    } catch (err) {
      setSubmitMessage({ type: 'error', text: err.response?.data?.message || 'Failed to record payment.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Batch helpers ────────────────────────────────────────────────────────────

  const openBatch = () => {
    setBatchRows([makeRow()])
    setBatchDone(false)
    setBatchOpen(true)
  }

  const closeBatch = () => {
    if (batchSubmitting) return
    setBatchOpen(false)
    if (batchDone) {
      fetchRecentPayments()
      fetchTodayTotal()
    }
  }

  const updateRow = (id, patch) => {
    setBatchRows(rows => rows.map(r => r._id === id ? { ...r, ...patch } : r))
  }

  const addRow = () => setBatchRows(rows => [...rows, makeRow()])

  const removeRow = (id) => {
    setBatchRows(rows => rows.length === 1 ? rows : rows.filter(r => r._id !== id))
  }

  const verifyBatchRow = async (id, studentId) => {
    if (!studentId.trim()) return
    updateRow(id, { verifying: true, verified: null, verifyError: '' })
    try {
      const { data } = await api.get(`/api/students/${studentId.trim()}`)
      updateRow(id, { verified: data, verifying: false })
    } catch (err) {
      updateRow(id, {
        verifyError: err.response?.data?.message || 'Not found',
        verifying: false,
      })
    }
  }

  const submitBatch = async () => {
    const pending = batchRows.filter(r => r.rowStatus !== 'success')

    const invalid = pending.find(r => !r.verified || !r.amount || !r.date || !r.referenceNo)
    if (invalid) {
      alert('Please verify all students and fill in all required fields before submitting.')
      return
    }

    setBatchSubmitting(true)

    for (const row of pending) {
      updateRow(row._id, { rowStatus: 'loading', rowMsg: '' })
      try {
        await api.post('/api/payments', {
          student_id: row.studentId.trim(),
          amount: parseFloat(row.amount),
          payment_date: row.date,
          reference_no: row.referenceNo.trim(),
          payment_method: row.paymentMethod,
        })
        updateRow(row._id, { rowStatus: 'success', rowMsg: 'Recorded' })
      } catch (err) {
        updateRow(row._id, {
          rowStatus: 'error',
          rowMsg: err.response?.data?.message || 'Failed',
        })
      }
    }

    setBatchSubmitting(false)
    setBatchDone(true)
  }

  // ── Display helpers ──────────────────────────────────────────────────────────

  const handleExport = async () => {
    try {
      const response = await api.get('/api/payments/export', { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `payments-export-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Failed to export. Please try again.')
    }
  }

  const todayMeterPct = Math.min((todayTotal / 1_000_000) * 100, 100)

  const formatAmount = (amount) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount)

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleString('en-PH', {
      month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit',
    })
  }

  const batchSuccessCount = batchRows.filter(r => r.rowStatus === 'success').length
  const batchErrorCount = batchRows.filter(r => r.rowStatus === 'error').length

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-h1 text-h1 text-primary">Payment Management</h1>
          <p className="text-on-secondary-container font-body-md mt-1">
            Verify and record student payments with administrative authority.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="px-4 py-2 text-body-sm font-semibold border border-outline-variant text-on-surface-variant bg-white rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            Export Report
          </button>
          <button
            onClick={openBatch}
            className="px-4 py-2 text-body-sm font-semibold bg-primary text-on-primary rounded-lg shadow-md hover:opacity-90 transition-opacity"
          >
            New Batch Entry
          </button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50">
              <h2 className="font-h3 text-h3 text-slate-900">Verified Payment Entry</h2>
              <p className="text-body-sm text-slate-500 mt-1">Manual entry for bank transfers and cash deposits.</p>
            </div>

            <form className="p-6 space-y-6" onSubmit={handleSubmit}>
              {/* Student ID Lookup */}
              <div className="space-y-2">
                <label className="text-label-bold font-label-bold text-slate-600 block uppercase">
                  Student ID Lookup
                </label>
                <div className="relative">
                  <input
                    name="studentId"
                    type="text"
                    value={form.studentId}
                    onChange={handleChange}
                    onBlur={lookupStudent}
                    onKeyDown={handleStudentKeyDown}
                    placeholder="e.g. 202100537"
                    className="w-full pl-4 pr-12 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all font-data-mono"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isLooking && (
                      <span className="material-symbols-outlined text-slate-400 animate-spin text-sm">refresh</span>
                    )}
                    {verifiedStudent && !isLooking && (
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'wght' 700" }}>check</span>
                      </div>
                    )}
                    {lookupError && !isLooking && (
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-500">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </div>
                    )}
                  </div>
                </div>
                {verifiedStudent && (
                  <div className="flex items-center gap-2 mt-2 px-1">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                      {verifiedStudent.student_name?.[0] ?? '?'}
                    </div>
                    <span className="text-xs font-medium text-slate-700">
                      Verified: {verifiedStudent.student_name ?? verifiedStudent.student_id} ({verifiedStudent.program ?? 'N/A'})
                    </span>
                  </div>
                )}
                {lookupError && (
                  <p className="text-xs text-red-500 px-1">{lookupError}</p>
                )}
              </div>

              {/* Amount + Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-label-bold font-label-bold text-slate-600 block uppercase">Amount (PHP)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₱</span>
                    <input
                      name="amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={form.amount}
                      onChange={handleChange}
                      required
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-container outline-none font-data-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-label-bold font-label-bold text-slate-600 block uppercase">Date</label>
                  <input
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-container outline-none font-data-mono"
                  />
                </div>
              </div>

              {/* Reference Number */}
              <div className="space-y-2">
                <label className="text-label-bold font-label-bold text-slate-600 block uppercase">Reference Number</label>
                <input
                  name="referenceNo"
                  type="text"
                  value={form.referenceNo}
                  onChange={handleChange}
                  required
                  placeholder="e.g. TXN-99201-B"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-container outline-none font-data-mono"
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <label className="text-label-bold font-label-bold text-slate-600 block uppercase">Payment Method</label>
                <select
                  name="paymentMethod"
                  value={form.paymentMethod}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-container outline-none"
                >
                  {PAYMENT_METHODS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Feedback */}
              {submitMessage && (
                <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
                  submitMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : 'bg-red-50 text-red-600 border border-red-100'
                }`}>
                  {submitMessage.text}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-primary text-white font-bold rounded-lg shadow-lg shadow-slate-200 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Recording...' : 'Commit Verified Payment'}
              </button>
            </form>
          </section>
        </div>

        {/* Right: Stats + Ledger */}
        <div className="lg:col-span-7 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="text-label-bold text-slate-500 uppercase tracking-tighter">Total Verified (Today)</div>
              <div className="text-h2 font-h2 text-slate-900 mt-1">{formatAmount(todayTotal)}</div>
              <div className="mt-3 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${todayMeterPct}%` }} />
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="text-label-bold text-slate-500 uppercase tracking-tighter">Verified Payments (Today)</div>
              <div className="text-h2 font-h2 text-slate-900 mt-1">
                {todayCount} {todayCount === 1 ? 'Entry' : 'Entries'}
              </div>
              <div className="mt-3 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="bg-primary h-full transition-all duration-500" style={{ width: `${Math.min((todayCount / 50) * 100, 100)}%` }} />
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-h3 text-h3 text-slate-900">Recent Ledger Activity</h2>
              <div className="flex gap-2">
                <button className="p-2 border border-slate-200 rounded hover:bg-slate-50 transition-colors">
                  <span className="material-symbols-outlined text-sm">filter_list</span>
                </button>
                <button onClick={fetchRecentPayments} className="p-2 border border-slate-200 rounded hover:bg-slate-50 transition-colors">
                  <span className="material-symbols-outlined text-sm">refresh</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-3 text-label-bold text-slate-500 uppercase tracking-wider">Reference</th>
                    <th className="px-6 py-3 text-label-bold text-slate-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-label-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                    <th className="px-6 py-3 text-label-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                    <th className="px-6 py-3 text-label-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentPayments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-400">
                        No payments recorded yet.
                      </td>
                    </tr>
                  ) : (
                    recentPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-data-mono text-slate-900">{payment.reference_no}</div>
                          <div className="text-[10px] text-slate-400">{formatDate(payment.created_at)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-slate-800">
                            {payment.student_accounts?.student_name ?? '—'}
                          </div>
                          <div className="text-xs text-slate-500">ID: {payment.student_id}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-sm font-data-mono font-bold text-slate-900">
                            {formatAmount(payment.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {payment.status === 'CLEARED' ? (
                            <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
                              Cleared
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-slate-400 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-lg">more_vert</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
              <button className="text-xs font-bold text-primary-container hover:underline uppercase tracking-widest">
                View Full Reconciliation Ledger
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* ── Batch Entry Modal ────────────────────────────────────────────────── */}
      {batchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-primary">Batch Payment Entry</h2>
                <p className="text-sm text-slate-500 mt-0.5">Add multiple payments and submit them all at once.</p>
              </div>
              <button
                onClick={closeBatch}
                disabled={batchSubmitting}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-slate-500">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-auto flex-1 px-6 py-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest pr-3">Student ID</th>
                    <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest pr-3">Amount (₱)</th>
                    <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest pr-3">Date</th>
                    <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest pr-3">Reference No.</th>
                    <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest pr-3">Method</th>
                    <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                    <th className="pb-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {batchRows.map((row) => (
                    <tr key={row._id} className="group">
                      {/* Student ID */}
                      <td className="py-3 pr-3 align-top">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={row.studentId}
                            onChange={e => updateRow(row._id, { studentId: e.target.value, verified: null, verifyError: '' })}
                            onKeyDown={e => e.key === 'Enter' && verifyBatchRow(row._id, row.studentId)}
                            placeholder="e.g. 202100537"
                            disabled={row.rowStatus === 'success' || batchSubmitting}
                            className="w-36 px-2.5 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary-container outline-none disabled:bg-slate-50 disabled:text-slate-400"
                          />
                          <button
                            type="button"
                            onClick={() => verifyBatchRow(row._id, row.studentId)}
                            disabled={!row.studentId.trim() || row.verifying || row.rowStatus === 'success' || batchSubmitting}
                            className="px-2 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                          >
                            {row.verifying ? (
                              <span className="material-symbols-outlined text-[14px] animate-spin">refresh</span>
                            ) : row.verified ? (
                              <span className="material-symbols-outlined text-[14px] text-emerald-600">check_circle</span>
                            ) : (
                              'Verify'
                            )}
                          </button>
                        </div>
                        {row.verified && (
                          <p className="text-[10px] text-emerald-600 font-medium mt-1 pl-0.5">
                            {row.verified.student_name ?? row.verified.student_id}
                          </p>
                        )}
                        {row.verifyError && (
                          <p className="text-[10px] text-red-500 mt-1 pl-0.5">{row.verifyError}</p>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3 pr-3 align-top">
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={row.amount}
                          onChange={e => updateRow(row._id, { amount: e.target.value })}
                          placeholder="0.00"
                          disabled={row.rowStatus === 'success' || batchSubmitting}
                          className="w-28 px-2.5 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary-container outline-none disabled:bg-slate-50 disabled:text-slate-400"
                        />
                      </td>

                      {/* Date */}
                      <td className="py-3 pr-3 align-top">
                        <input
                          type="date"
                          value={row.date}
                          onChange={e => updateRow(row._id, { date: e.target.value })}
                          disabled={row.rowStatus === 'success' || batchSubmitting}
                          className="w-36 px-2.5 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary-container outline-none disabled:bg-slate-50 disabled:text-slate-400"
                        />
                      </td>

                      {/* Reference */}
                      <td className="py-3 pr-3 align-top">
                        <input
                          type="text"
                          value={row.referenceNo}
                          onChange={e => updateRow(row._id, { referenceNo: e.target.value })}
                          placeholder="TXN-XXXXX"
                          disabled={row.rowStatus === 'success' || batchSubmitting}
                          className="w-36 px-2.5 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary-container outline-none disabled:bg-slate-50 disabled:text-slate-400"
                        />
                      </td>

                      {/* Method */}
                      <td className="py-3 pr-3 align-top">
                        <select
                          value={row.paymentMethod}
                          onChange={e => updateRow(row._id, { paymentMethod: e.target.value })}
                          disabled={row.rowStatus === 'success' || batchSubmitting}
                          className="w-32 px-2.5 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-container outline-none disabled:bg-slate-50 disabled:text-slate-400"
                        >
                          {PAYMENT_METHODS.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </td>

                      {/* Row status */}
                      <td className="py-3 pr-3 align-top text-center">
                        {row.rowStatus === 'idle' && (
                          <span className="text-[10px] text-slate-400 font-bold uppercase">—</span>
                        )}
                        {row.rowStatus === 'loading' && (
                          <span className="material-symbols-outlined text-[18px] text-slate-400 animate-spin">refresh</span>
                        )}
                        {row.rowStatus === 'success' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                            <span className="material-symbols-outlined text-[12px]">check</span>
                            Recorded
                          </span>
                        )}
                        {row.rowStatus === 'error' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold" title={row.rowMsg}>
                            <span className="material-symbols-outlined text-[12px]">error</span>
                            Failed
                          </span>
                        )}
                      </td>

                      {/* Remove row */}
                      <td className="py-3 align-top">
                        <button
                          type="button"
                          onClick={() => removeRow(row._id)}
                          disabled={batchRows.length === 1 || row.rowStatus === 'success' || batchSubmitting}
                          className="w-7 h-7 flex items-center justify-center rounded-full text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Add Row */}
              {!batchDone && (
                <button
                  type="button"
                  onClick={addRow}
                  disabled={batchSubmitting}
                  className="mt-4 flex items-center gap-2 text-sm font-bold text-primary hover:underline disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  Add Row
                </button>
              )}

              {/* Done summary */}
              {batchDone && (
                <div className="mt-4 px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-500">task_alt</span>
                  Batch complete —
                  <span className="font-bold text-emerald-600">{batchSuccessCount} recorded</span>
                  {batchErrorCount > 0 && (
                    <span className="font-bold text-red-500">{batchErrorCount} failed</span>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-b-2xl">
              <span className="text-sm text-slate-500">
                {batchRows.length} {batchRows.length === 1 ? 'entry' : 'entries'}
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={closeBatch}
                  disabled={batchSubmitting}
                  className="px-4 py-2 text-sm font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-40"
                >
                  {batchDone ? 'Close' : 'Cancel'}
                </button>
                {!batchDone && (
                  <button
                    onClick={submitBatch}
                    disabled={batchSubmitting}
                    className="px-6 py-2 text-sm font-bold bg-primary text-on-primary rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {batchSubmitting && (
                      <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                    )}
                    {batchSubmitting ? 'Processing...' : 'Submit All'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
