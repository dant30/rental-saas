import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1rem",
        md: "1.25rem",
        lg: "1.5rem",
        xl: "2rem",
      },
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Space Grotesk", ...defaultTheme.fontFamily.sans],
        mono: ["JetBrains Mono", ...defaultTheme.fontFamily.mono],
        display: ["Space Grotesk", ...defaultTheme.fontFamily.sans],
        body: ["Space Grotesk", ...defaultTheme.fontFamily.sans],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      colors: {
        primary: {
          50: "#eef7ff",
          100: "#d8ecff",
          400: "#2b82bc",
          500: "#0b69a3",
          600: "#0a5f94",
          700: "#0a4f7a",
          800: "#083f62",
          900: "#102a43",
        },
        brand: {
          50: "#eef7ff",
          100: "#d8ecff",
          500: "#0b69a3",
          700: "#0a4f7a",
          900: "#102a43",
        },
        ink: "#20242d",
        sand: "#f5efe3",
        mint: "#38a98f",
        gold: "#d9a441",
        success: {
          50: "#ecf9f2",
          100: "#d1f1e0",
          200: "#a7e2c5",
          500: "#2e946d",
          600: "#287f5d",
          700: "#21664c",
          800: "#1a4e3a",
        },
        warning: {
          50: "#fff8ec",
          100: "#fceacc",
          200: "#f7d89a",
          500: "#b27b18",
          600: "#956714",
          700: "#765110",
          800: "#5a3d0c",
        },
        danger: {
          50: "#fff2f2",
          100: "#ffdede",
          200: "#ffb7b7",
          500: "#d85f5f",
          600: "#b84f4f",
          700: "#943f3f",
          800: "#702f2f",
        },
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        strong: "var(--shadow-strong)",
        panel: "0 24px 80px rgba(27, 31, 38, 0.16)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 180ms ease-out",
        "slide-up": "slide-up 220ms ease-out",
      },
    },
  },
  plugins: [],
};
