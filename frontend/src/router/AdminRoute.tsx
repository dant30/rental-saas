import { Navigate, Outlet } from "react-router-dom";

import { routePaths } from "../core/constants/routePaths";
import { getStoredSession } from "./PrivateRoute";

const adminRoles = new Set(["admin", "landlord", "owner"]);

const AdminRoute = () => {
  const session = getStoredSession();

  if (!session.isAuthenticated) {
    return <Navigate replace to={routePaths.login} />;
  }

  if (!adminRoles.has(session.role)) {
    return <Navigate replace to={routePaths.dashboard} />;
  }

  return <Outlet />;
};

export default AdminRoute;
