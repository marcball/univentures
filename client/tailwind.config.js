/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx}"],
  darkMode: 'class',  //https://v2.tailwindcss.com/docs/dark-mode
  theme: {
    extend: {
      colors: {
        'BG_LIGHTMODE': 'white',
        'BG_DARKMODE': '#101c26',
        'TEXT_LIGHTMODE': '#101c26',
        'TEXT_DARKMODE': 'white',
        'MAIN_BLUE': '#101c26',
      },
      spacing: {
        '26': '6.5rem',
      },
    },
  },
  plugins: [],
}

