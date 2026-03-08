import { useEffect } from "react";

import { loadTranslations } from "./core/i18n/i18n";
import { useAuth } from "./features/auth/hooks/useAuth";
import AppRoutes from "./router/routes";

const App = () => {
  const auth = useAuth();

  useEffect(() => {
    void loadTranslations("en");
  }, []);

  return (
    <>
      {auth.status === "loading" ? (
        <div style={{ position: "fixed", left: 16, top: 16, zIndex: 20 }} className="status-badge">
          Hydrating profile...
        </div>
      ) : null}
      <AppRoutes />
    </>
  );
};

export default App;
