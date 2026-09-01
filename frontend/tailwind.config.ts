import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: "#f1faf4",
          100: "#dff3e6",
          200: "#bce6cc",
          300: "#8ed3a8",
          400: "#5bbb81",
          500: "#37a163",
          600: "#27824e",
          700: "#206841",
          800: "#1c5336",
          900: "#18452e",
          950: "#0a2818",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Inter",
          "Roboto",
          "'Helvetica Neue'",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(16,24,40,0.04), 0 2px 8px -2px rgba(16,24,40,0.06)",
        card: "0 2px 6px -1px rgba(16,24,40,0.05), 0 8px 24px -8px rgba(16,24,40,0.08)",
        nav: "0 -1px 0 rgba(16,24,40,0.06), 0 -4px 16px -6px rgba(16,24,40,0.08)",
      },
      maxWidth: {
        app: "480px",
      },
    },
  },
  plugins: [],
};
export default config;
