/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sinergya: {
          green: "#4FBF9F",
          blue: "#3A7BD5",
          turquoise: "#63D2C6",
          background: "#F7F9F8",
          dark: "#0F172A",
        },
      },
      backgroundImage: {
        "sinergya-gradient":
          "linear-gradient(135deg, #4FBF9F 0%, #63D2C6 50%, #3A7BD5 100%)",
      },
      boxShadow: {
        soft: "0 10px 25px -10px rgba(0,0,0,0.15)",
      },
    },
  },

  plugins: {
    "@tailwindcss/postcss": {},
  },
};