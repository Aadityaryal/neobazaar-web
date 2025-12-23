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
        'dark-card': 'var(--card)',
        'dark-border': 'var(--border)',
        'primary-600': 'var(--primary)',
        'primary-700': 'var(--primary-dark)',
        // Add other custom colors as needed
      },
    },
  },
  plugins: [],
}