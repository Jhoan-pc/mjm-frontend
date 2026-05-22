/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Habilitamos el cambio por clase .dark
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- PALETA DINÁMICA ---
        primary: "#78B7D0",
        secondary: {
          light: "#1A202C",
          dark: "#171F33"
        },
        tertiary: "#E3A06D",
        neutral: "#757779",
        // Colores institucionales MJM — registrados formalmente para uso nativo en Tailwind
        "mjm-navy":   "#234c74",
        "mjm-orange": "#f7931b",
        // Los colores de superficie ahora se manejarán principalmente vía CSS Variables
      },
      spacing: {
        'gutter': '24px',
        'stack-sm': '8px',
        'stack-md': '16px',
        'stack-lg': '32px',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
