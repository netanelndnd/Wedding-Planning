import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf4f5',
          100: '#fbe8eb',
          200: '#f7d1d7',
          300: '#f1a9b4',
          400: '#e97a8c',
          500: '#dc4f67',
          600: '#c73452',
          700: '#a72443',
          800: '#8b203e',
          900: '#761f3a',
          950: '#410d1c',
        },
        secondary: {
          50: '#f5f7fa',
          100: '#eaeef4',
          200: '#d0dbe7',
          300: '#a8bfd3',
          400: '#799dbb',
          500: '#5881a5',
          600: '#43678a',
          700: '#375370',
          800: '#30475e',
          900: '#2b3d50',
          950: '#1d2835',
        },
      },
    },
  },
  plugins: [],
};

export default config;
