/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mjm-navy': '#234c74',
        'mjm-orange': '#ee8c2c',
      }
    },
  },
  plugins: [],
}
