// frontend/tailwind.config.cjs
/** @type {import('tailwindcss').Config} */
module.exports = {
  // ========= THE FIX IS HERE =========
  // This line tells Tailwind to use the 'class' strategy for dark mode,
  // which activates all your `dark:` utility classes.
  darkMode: 'class',
  // ===================================

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}