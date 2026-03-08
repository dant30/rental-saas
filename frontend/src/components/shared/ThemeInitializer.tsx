import { useEffect } from "react";
import { useTheme } from "@contexts/ThemeContext";

const ThemeInitializer = () => {
  const { theme } = useTheme();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);

    let metaThemeColor = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    if (!metaThemeColor) {
      metaThemeColor = document.createElement("meta");
      metaThemeColor.name = "theme-color";
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.content = theme === "dark" ? "#0f172a" : "#ffffff";
  }, [theme]);

  return null;
};

export default ThemeInitializer;
