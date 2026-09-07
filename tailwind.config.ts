import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          DEFAULT: '#363636',
          hover: '#262626',
          heading: '#2c2c2c',
        },
        neutral: {
          border: '#d2d6dc',
          icon: '#828282',
          label: '#5a5a5a',
        },
        brand: {
          charcoal: '#3e3e3e',
          'charcoal-hover': '#2d2d2d',
          muted: '#686868',
          border: '#eaeaea',
          bg: '#fcfcfc',
          title: '#24292f',
          textMuted: '#6b7280',
          inputBorder: '#cbd5e1',
        },
        subtext: '#686868',
        bordercol: '#cbd5e1',
      },
      borderRadius: {
        '2.5xl': '1.35rem',
        '4xl': '2.25rem',
      },
      boxShadow: {
        'card-subtle': '0 2px 8px -2px rgba(0, 0, 0, 0.03), 0 1px 3px 0 rgba(0, 0, 0, 0.02)'
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          '"Open Sans"',
          '"Helvetica Neue"',
          'sans-serif'
        ],
      }
    },
  },
  plugins: [],
};
export default config;
