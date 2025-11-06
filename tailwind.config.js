/** @type {import('tailwindcss').Config} */

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#2196F3',      // azul SAMSA
        secondary: '#E3F2FD',    // celeste claro (fondo)
        text: '#212121'          // gris oscuro para texto
      }
    },
  },
  plugins: [],
};
