import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-background text-white selection:bg-clinical-blue/30 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto bg-background p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
