import "./layout.scss";
import Navbar from "../../components/navbar/Navbar";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

function Layout() {
  return (
    <div className="layout">
      <div className="navbar">
        <Navbar />
      </div>
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}

function AdminLayout() {
  return (
    <div className="layout adminLayout">
      <div className="content fullWidth">
        <Outlet />
      </div>
    </div>
  );
}

function RequireAuth() {
  const { currentUser } = useContext(AuthContext);
  const location = useLocation();
  const isAdminPage = location.pathname === "/admin";

  if (!currentUser) return <Navigate to="/login" />;
  
  // For admin page, use the layout without navbar
  if (isAdminPage) {
    return (
      <div className="layout adminLayout">
        <div className="content fullWidth">
          <Outlet />
        </div>
      </div>
    );
  }
  
  // For other protected routes, use the standard layout with navbar
  return (
    <div className="layout">
      <div className="navbar">
        <Navbar />
      </div>
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}

export { Layout, RequireAuth, AdminLayout };
