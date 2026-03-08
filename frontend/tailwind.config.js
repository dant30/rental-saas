/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#20242d",
        sand: "#f5efe3",
        mint: "#38a98f",
        gold: "#d9a441",
      },
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["Manrope", "sans-serif"],
      },
      boxShadow: {
        panel: "0 24px 80px rgba(27, 31, 38, 0.16)",
      },
    },
  },
  plugins: [],
};
