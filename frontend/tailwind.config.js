/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans:  ['Space Grotesk', 'sans-serif'],
        clash: ['Clash Display', 'sans-serif'],
        mono:  ['JetBrains Mono', 'monospace'],
      },
    }
  },
  plugins: [],
};
