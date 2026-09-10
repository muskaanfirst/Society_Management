/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f8fafc",
        surface: "#ffffff",
        "surface-2": "#f1f5f9",
        border: "#e2e8f0",
        navy: "#0f172a",
        foreground: "#0f172a",
        muted: "#475569",
        "slate-card": "#8897ad",
        accent: "#f59e0b",
        "accent-soft": "#fef3c7",
        "accent-text": "#b45309",
        "accent-yellow": "#f59e0b",
        "navy-dark": "#0f172a",
        success: "#16a34a",
        "success-soft": "#dcfce7",
        danger: "#ef4444",
        "danger-soft": "#fee2e2",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};
