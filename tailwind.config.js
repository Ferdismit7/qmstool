// tailwind.config.js
// This file configures Tailwind CSS for the project.
// - The 'content' array tells Tailwind where to look for class names to generate styles.
// - The 'theme' section allows you to extend or override the default Tailwind theme.
// - The 'plugins' array is for any Tailwind plugins you want to use.

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#e11b22',    // Red
          dark: '#003366',       // Navy
          blue: '#3b82f6',       // Blue
          accent1: '#fcd3c1',    // Light Peach
          accent2: '#c1e6ed',    // Light Blue
          white: '#ffffff',      // White
          gray1: '#4d4d4f',     // Dark Gray
          gray2: '#8a8c8e',     // Medium Gray
          gray3: '#c7c8ca',     // Light Gray
          black1: '#000000d9',  // 85% black
        },
      },
      fontFamily: {
        sans: ['Calibri', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
} 