import { Navigate, Outlet } from "react-router-dom";

import { getStoredSession } from "./PrivateRoute";

const AdminRoute = () => {
  const session = getStoredSession();
  const adminRoles = new Set(["admin", "landlord", "owner"]);

  if (!session.isAuthenticated) {
    return <Navigate replace to="/login" />;
  }

  if (!adminRoles.has(session.role)) {
    return <Navigate replace to="/app" />;
  }

  return <Outlet />;
};

export default AdminRoute;
