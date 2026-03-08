import Button from "./components/shared/Button";
import { useTheme } from "./core/contexts/ThemeContext";
import { useAuth } from "./features/auth/hooks/useAuth";
import AppRoutes from "./router/routes";

const App = () => {
  const { theme, toggleTheme } = useTheme();
  const auth = useAuth();

  return (
    <>
      <Button
        aria-label="Toggle theme"
        className="app-theme-toggle"
        onClick={toggleTheme}
        type="button"
      >
        {theme === "light" ? "Dark" : "Light"}
      </Button>
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
