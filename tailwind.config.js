/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FEF3E2",
        brandPink: "#EC4899",
        brandTeal: "#14B8A6",
        brandNavy: "#2A4170",
        alert: "#DC2626",
      },
    },
  },
  plugins: [],
};
