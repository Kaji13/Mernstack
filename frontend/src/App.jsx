import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomeDataProvider } from './context/HomeDataContext'
import HomePage from './pages/HomePage'
import ServicesPage from './pages/ServicesPage'
import DoctorsPage from './pages/DoctorsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import DashboardPage from './pages/DashboardPage'
import ChatPage from './pages/ChatPage'
import PaymentReturnPage from './pages/PaymentReturnPage'
import DoctorPortalPage from './pages/DoctorPortalPage'
import StaffManagementPage from './pages/StaffManagementPage'
import PatientManagementPage from './pages/PatientManagementPage'
import ProtectedRoute from './components/ProtectedRoute'
import { DoctorProvider } from './context/DoctorContext'
import { DepartmentProvider } from './context/DepartmentContext'
import DepartmentManagementPage from './pages/DepartmentManagementPage'
import './App.css'

function App() {
  return (
    <HomeDataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/doctors" element={<DoctorProvider><DoctorsPage /></DoctorProvider>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/payments/khalti/return" element={<PaymentReturnPage />} />
          <Route path="/payments/mock" element={<PaymentReturnPage />} />
          <Route path="/payments/esewa/return" element={<PaymentReturnPage />} />
          <Route path="/doctor" element={<ProtectedRoute roles={['doctor']}><DoctorPortalPage /></ProtectedRoute>} />
          <Route path="/staff" element={<ProtectedRoute roles={['admin']}><StaffManagementPage /></ProtectedRoute>} />
          <Route path="/patients" element={<ProtectedRoute roles={['admin', 'editor', 'doctor']}><PatientManagementPage /></ProtectedRoute>} />
          <Route path="/departments" element={<ProtectedRoute roles={['admin', 'editor']}><DepartmentProvider><DepartmentManagementPage /></DepartmentProvider></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </HomeDataProvider>
  )
}

export default App
