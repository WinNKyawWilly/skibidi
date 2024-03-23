/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.{html,js,ejs}",
  "./node_modules/flowbite/**/*.js"],
  
  theme: {
    extend: {
      spacing: {
        '104': '26rem',
        '112': '28rem',
        '120': '30rem',
        '128': '32rem',
        '136': '34rem',
        '144': '36rem',
      },
      aspectRatio: {
        '3/4': '3 / 4',
        '10/16' : '10 / 16',
      },
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        'c0': '#FCFFE8',
        'c1': '#EDF1D6',
        'c2': '#9DC08B',
        'c3': '#609966',
        'c4': '#40513B',
        'c5': '#426B1F',
        'white': '#ffffff',
        'purple': '#3f3cbb',
        'midnight': '#121063',
        'metal': '#565584',
        'tahiti': '#3ab7bf',
        'silver': '#ecebff',
        'bubble-gum': '#ff77e9',
        'bermuda': '#78dcca',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('flowbite/plugin'),
  ],
}

