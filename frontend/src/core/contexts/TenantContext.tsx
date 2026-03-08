import { createContext, ReactNode, useContext, useMemo, useState } from "react";

interface TenantContextValue {
  tenantDomain: string;
  setTenantDomain: (value: string) => void;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

export const TenantProvider = ({ children }: { children: ReactNode }) => {
  const [tenantDomain, setTenantDomain] = useState(
    typeof window === "undefined" ? "localhost" : window.location.hostname,
  );
  const value = useMemo(() => ({ tenantDomain, setTenantDomain }), [tenantDomain]);
  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used inside TenantProvider");
  }
  return context;
};
