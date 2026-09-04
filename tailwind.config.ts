import type { Config } from "tailwindcss";

const config: Config = {
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
          500: "#5b5bf5",
          600: "#4a44e0",
          700: "#3a34b8",
          900: "#211f5c",
        },
      },
    },
  },
  plugins: [],
};

export default config;
