/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(220 87% 60%)',
        accent: 'hsl(260 80% 65%)',
        bg: 'hsl(220 14% 96%)',
        surface: 'hsl(220 14% 100%)',
        text: 'hsl(220 14% 15%)',
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
      },
      spacing: {
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
      },
      boxShadow: {
        'card': '0 4px 12px hsla(220, 9%, 61%, 0.12)',
      },
    },
  },
  plugins: [],
}