import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomeDataProvider } from './context/HomeDataContext'
import HomePage from './pages/HomePage'
import ServicesPage from './pages/ServicesPage'
import './App.css'

function App() {
  return (
    <HomeDataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
        </Routes>
      </BrowserRouter>
    </HomeDataProvider>
  )
}

export default App
