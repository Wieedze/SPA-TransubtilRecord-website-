/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Acumin Variable", "system-ui", "sans-serif"], // Primary font
        display: ["Eras ITC", "Acumin Variable", "sans-serif"], // Secondary font for headings
      },
      colors: {
        brand: {
          900: "#262626", // fond gris chaud
          700: "#1a1a1a", // gris plus sombre
          500: "#808782", // accent gris-vert
          300: "#FAF4D3", // accent crème
          acid: "#a3ff12", // touche psyché
        },
      },
    },
  },
  plugins: [],
}
