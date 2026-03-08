import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { getStoredSession } from "./PrivateRoute";

interface FeatureGateProps {
  feature: string;
  children: ReactNode;
  fallbackPath?: string;
}

const FeatureGate = ({ feature, children, fallbackPath = "/app" }: FeatureGateProps) => {
  const session = getStoredSession();

  if (!session.isAuthenticated) {
    return <Navigate replace to="/login" />;
  }

  if (!session.enabledFeatures.includes(feature)) {
    return <Navigate replace to={fallbackPath} />;
  }

  return <>{children}</>;
};

export default FeatureGate;
