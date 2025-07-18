/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}', // Matches your src/ structure
  ],
  theme: {
    extend: {
      colors: {
        'dark-blue': '#1e3a8a',
        'light-gray': '#f3f4f6',
      },
    },
  },
  plugins: [],
};