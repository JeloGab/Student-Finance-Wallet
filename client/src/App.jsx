import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import AuthCallback from './pages/AuthCallback'
import PaymentManagement from './pages/admin/PaymentManagement'
import AdminDashboard from './pages/admin/AdminDashboard'
import ActivityLogs from './pages/admin/ActivityLogs'
import StudentDashboard from './pages/student/StudentDashboard'
import StudentBilling from './pages/student/StudentBilling'

function PlaceholderPage({ title }) {
  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-slate-400 font-medium">{title} — coming soon</p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        <Route path="/finance/payments" element={
          <Layout><PaymentManagement /></Layout>
        } />
        <Route path="/admin/dashboard" element={
          <Layout><AdminDashboard /></Layout>
        } />
        <Route path="/dashboard" element={
          <Layout><StudentDashboard /></Layout>
        } />
        <Route path="/billing" element={
          <Layout><StudentBilling /></Layout>
        } />
        <Route path="/activity" element={
          <Layout><ActivityLogs /></Layout>
        } />
        <Route path="/settings" element={
          <Layout><PlaceholderPage title="Settings" /></Layout>
        } />
        <Route path="/support" element={
          <Layout><PlaceholderPage title="Support" /></Layout>
        } />
        <Route path="/unauthorized" element={
          <div className="flex items-center justify-center min-h-screen">
            <p className="text-red-500 font-medium">Access denied.</p>
          </div>
        } />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
