import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Space Grotesk", ...defaultTheme.fontFamily.sans],
        mono: ["JetBrains Mono", ...defaultTheme.fontFamily.mono],
        display: ["Space Grotesk", ...defaultTheme.fontFamily.sans],
        body: ["Space Grotesk", ...defaultTheme.fontFamily.sans],
      },
      colors: {
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
      },
      boxShadow: {
        panel: "0 24px 80px rgba(27, 31, 38, 0.16)",
      },
    },
  },
  plugins: [],
};
