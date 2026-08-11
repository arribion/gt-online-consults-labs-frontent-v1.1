/** @type {import('tailwindcss').Config} */

module.exports = {
  theme: {
    extend: {
      animation: {
        infiniteScroll: "infiniteScroll 25s linear infinite",
      },
      keyframes: {
        infiniteScroll: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};