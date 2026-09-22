import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import BackToTop from '../components/BackToTop'
import AdminDepartments from '../components/AdminDepartments'
import './DashboardPage.css'

function DepartmentManagementPage() {
  return <div className="dashboard-page"><Navbar /><main className="dashboard-page__main container">
    <div className="dashboard-page__head"><div><h1>Department management</h1><p>Organize clinic services and control which departments are available for appointments.</p></div><Link className="btn btn--outline" to="/dashboard">Back to dashboard</Link></div>
    <AdminDepartments />
  </main><BackToTop /><Footer /></div>
}

export default DepartmentManagementPage
