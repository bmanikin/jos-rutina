/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#09090b',
          900: '#121113',
          850: '#18171a',
          800: '#222026',
          700: '#2e2b33',
        },
        roseAcc: {
          light: '#fce7f3',
          soft: '#fbcfe8',
          mid: '#f472b6',
          muted: '#e0a6aa',
          deep: '#be185d',
        },
        // Categorías: colores variados y no tan brillantes (tonos pastel empolvados)
        cat: {
          escuela: '#e2847a',
          trabajo: '#7e97b8',
          cuidado: '#d9829f',
          michis: '#af8ebf',
          hogar: '#c99a82',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'rose-glow': '0 0 25px -5px rgba(244, 114, 182, 0.15)',
        'card-soft': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
