/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: {
          light: '#fbfaf8',
          dark: '#0c0d10',
        },
        surface: {
          light: '#ffffff',
          'subtle-light': '#f3f2ee',
          dark: '#131519',
          'subtle-dark': '#191b22',
        },
        hairline: {
          light: '#e6e4dc',
          'strong-light': '#d2cfc4',
          dark: '#23262d',
          'strong-dark': '#323640',
        },
        ink: {
          primary: {
            light: '#111215',
            dark: '#f3f4f6',
          },
          secondary: {
            light: '#616571',
            dark: '#8b8f9a',
          },
          muted: {
            light: '#9da0ab',
            dark: '#585c67',
          },
        },
        vermilion: {
          DEFAULT: '#e5484d',
          dark: '#ff6369',
          bg: '#fdf2f2',
          'bg-dark': '#291415',
        },
        cobalt: {
          DEFAULT: '#2563eb',
          dark: '#60a5fa',
          bg: '#eff6ff',
          'bg-dark': '#111e38',
        },
        pine: {
          DEFAULT: '#059669',
          dark: '#34d399',
          bg: '#ecfdf5',
          'bg-dark': '#0d281e',
        },
        ochre: {
          DEFAULT: '#d97706',
          dark: '#fbbf24',
          bg: '#fffbeb',
          'bg-dark': '#2b1f09',
        },
      },
      fontFamily: {
        sans: [
          'Plus Jakarta Sans',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      boxShadow: {
        tactile: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'tactile-hover': '0 2px 5px -1px rgba(0, 0, 0, 0.08), 0 1px 3px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
};
