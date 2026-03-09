import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { routePaths } from "../core/constants/routePaths";
import { getStoredSession } from "./PrivateRoute";

interface FeatureGateProps {
  feature: string;
  children: ReactNode;
  fallbackPath?: string;
}

const FeatureGate = ({ feature, children, fallbackPath = routePaths.dashboard }: FeatureGateProps) => {
  const session = getStoredSession();

  if (!session.isAuthenticated) {
    return <Navigate replace to={routePaths.login} />;
  }

  if (!session.enabledFeatures.includes(feature)) {
    return <Navigate replace to={fallbackPath} />;
  }

  return <>{children}</>;
};

export default FeatureGate;
