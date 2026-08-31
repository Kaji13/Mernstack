import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomeDataProvider } from './context/HomeDataContext'
import HomePage from './pages/HomePage'
import ServicesPage from './pages/ServicesPage'
import DoctorsPage from './pages/DoctorsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import './App.css'

function App() {
  return (
    <HomeDataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </BrowserRouter>
    </HomeDataProvider>
  )
}

export default App
