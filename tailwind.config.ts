import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          indigo: '#2A2D7C',
          blue: '#3D7FFF',
          gold: '#F5B700',
          white: '#F8F9FB',
          gray: '#444A54',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
        accent: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;

