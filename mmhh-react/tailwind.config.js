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
          dark: '#1a202c'
        }
      }
    },
  },
  plugins: [],
};
