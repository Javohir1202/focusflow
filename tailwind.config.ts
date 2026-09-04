import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4f5ff",
          100: "#e6e8ff",
          300: "#a9adff",
          400: "#8385f8",
          500: "#5b5bf5",
          600: "#4a44e0",
          700: "#3a34b8",
          800: "#2b2789",
          900: "#211f5c",
        },
      },
    },
  },
  plugins: [],
};

export default config;
