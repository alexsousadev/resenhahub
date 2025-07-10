/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/*.html","./public/js/*.js","./src/**/*.{js,ts}"],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      animation: {
        'gradient': 'gradient 3s ease infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      lineClamp: {
        2: '2',
        3: '3',
      }
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
};
