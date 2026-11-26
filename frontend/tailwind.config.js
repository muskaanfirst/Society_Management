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
        background: "#f7f7f5",
        surface: "#ffffff",
        "surface-2": "#f3f3f1",
        border: "rgba(17, 17, 17, 0.08)",
        navy: "#111111",
        foreground: "#111111",
        muted: "#6b7280",
        "slate-card": "#c4b5fd",
        "pastel-lavender": "#c4b5fd",
        "pastel-amber": "#fbbf24",
        "pastel-sky": "#93c5fd",
        "pastel-pink": "#f9a8d4",
        "pastel-sage": "#a7f3d0",
        accent: "#fbbf24",
        "accent-soft": "#fef3c7",
        "accent-text": "#b45309",
        "accent-yellow": "#fbbf24",
        "navy-dark": "#111111",
        success: "#16a34a",
        "success-soft": "#d2f8e4",
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
