import Navbar from '../Navbar/Navbar'
import { Outlet } from 'react-router-dom'
import Footer from '../footer/footer'

const Layout = () => {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  )
}

export default Layout
