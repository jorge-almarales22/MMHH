/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        cerrejon: {
          gold: '#E2B53C',
          orange: '#C77953',
          orangeDark: '#A85F3D',
          orangeSoft: '#FBF1EC',
          dark: '#12181F',
          slate: '#1E293B'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', '-apple-system', 'sans-serif']
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(.94) translateY(8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' }
        },
        drawCheck: { '0%': { strokeDashoffset: '48' }, '100%': { strokeDashoffset: '0' } }
      },
      animation: {
        'fade-in': 'fadeIn .18s ease-out forwards',
        'pop-in': 'popIn .22s cubic-bezier(.16,1,.3,1) forwards',
        'draw-check': 'drawCheck .45s .12s ease-out forwards'
      }
    },
  },
  plugins: [],
};
