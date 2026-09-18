/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-ui)", "var(--font-noto-devanagari)", "var(--font-inter)", "sans-serif"],
        headline: ["var(--font-headline)", "var(--font-mukta)", "sans-serif"],
        body: ["var(--font-body)", "var(--font-noto-devanagari)", "sans-serif"],
        ui: ["var(--font-ui)", "var(--font-noto-devanagari)", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#fef2f2",
          100: "#ffe1e1",
          500: "#ef4444",
          600: "#e50914",
          700: "#b91c1c",
          900: "#7f1d1d",
        },
      },
    },
  },
  plugins: [],
};
