/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          900: "#030008", // fond très sombre
          700: "#12061f", // violet sombre
          500: "#a855f7", // accent violet
          300: "#c4b5fd", // accent clair
          acid: "#a3ff12", // touche psyché
        },
      },
    },
  },
  plugins: [],
}
