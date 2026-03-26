/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mjm-navy': 'var(--color-mjm-navy, #234c74)',
        'mjm-orange': 'var(--color-mjm-orange, #ee8c2c)',
      }
    },
  },
  plugins: [],
}
