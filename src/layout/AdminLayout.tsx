import { Outlet } from "react-router-dom";
import SideBar from "../components/admin/SideBar";
import Header from "../components/admin/Header";

const AdminLayout = () => {
    return (
      <>
        <div className="flex">
          <SideBar />
          <main className="w-full ml-[18%]">
            <Header />
            <Outlet />
          </main>
        </div>
      </>
    );
}

export default AdminLayout