import { Outlet } from "react-router-dom";
import ClientHeader from "../components/client/ClientHeader";
import SideBar from "../components/client/SideBar";
const ClientLayout = () => {
  return (
    <>
      <div className="flex  text-slate-50">
        <SideBar/>
        <main className="w-full ml-62.5">
          <ClientHeader />
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default ClientLayout