import { Outlet } from "react-router-dom"
import Navbar from "../components/landing/Navbar"
import Footer from "../components/landing/Footer"

const MainLayout = () => {
  return (
    <>
      <Navbar />
          <main> 
            <Outlet />
      </main>
      <Footer/>
      </>
  )
}

export default MainLayout