import Button from "./components/shared/Button";
import { useTheme } from "./core/contexts/ThemeContext";
import AppRoutes from "./router/routes";

const App = () => {
  const { theme, toggleTheme } = useTheme();

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
      <AppRoutes />
    </>
  );
};

export default App;
