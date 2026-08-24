import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";
import "./DashboardLayout.css";

function DashboardLayout({ children }) {
  return (
    <div className="layout">
      <Sidebar />

      <div className="main-content">
        <Header />

        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;