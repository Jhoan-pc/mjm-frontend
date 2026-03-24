/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mjm-navy': '#1D2A4C',
        'mjm-orange': '#F26122',
      }
    },
  },
  plugins: [],
}
