/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        /* Azul de trazado (Dykem): la tinta que se pinta sobre el metal antes de rayar. */
        dye: {
          DEFAULT: '#0B3040',
          deep: '#06202C',
          mid: '#134860',
          line: '#1D6180'
        },
        /* La linea que deja el rayador: metal desnudo bajo la tinta. */
        scribe: '#93C6D4',
        /* Neutros de fundicion: grises frios con fondo verde, no azul SaaS. */
        iron: {
          50: '#F4F6F7',
          100: '#E8ECEE',
          200: '#D6DCDF',
          300: '#B7C1C6',
          400: '#8B989F',
          500: '#69777E',
          600: '#4F5C63',
          700: '#3B464C',
          800: '#2A3338',
          900: '#1A2125'
        },
        /* Marca Cerrejon: fijada por el brief, no se toca. */
        brand: {
          DEFAULT: '#C77953',
          deep: '#A85F3D',
          wash: '#F9EFE9'
        },
        alarm: { DEFAULT: '#B23B2E', wash: '#FBEDEB' },
        spec: { DEFAULT: '#2F6F5E', wash: '#EBF3F0' }
      },
      fontFamily: {
        display: ['"Saira Condensed"', 'Oswald', 'Arial Narrow', 'sans-serif'],
        sans: ['"IBM Plex Sans"', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'Consolas', 'monospace']
      },
      letterSpacing: { dial: '0.14em', plate: '0.08em' },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        cardIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        stamp: {
          '0%': { opacity: '0', transform: 'scale(1.35)' },
          '60%': { opacity: '1', transform: 'scale(.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        sweep: { '0%': { transform: 'scaleX(0)' }, '100%': { transform: 'scaleX(1)' } }
      },
      animation: {
        'fade-in': 'fadeIn .16s ease-out both',
        'card-in': 'cardIn .24s cubic-bezier(.2,.8,.3,1) both',
        'stamp': 'stamp .34s cubic-bezier(.2,1.1,.3,1) both',
        'sweep': 'sweep .5s cubic-bezier(.2,.8,.3,1) both'
      }
    }
  },
  plugins: []
};
