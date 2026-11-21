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
          light: '#fbfbfb',
          dark: '#0c0d0f',
        },
        surface: {
          light: '#ffffff',
          dark: '#14161a',
          muted: {
            light: '#f4f5f7',
            dark: '#1a1d23',
          },
        },
        border: {
          subtle: {
            light: '#eaebed',
            dark: '#22252c',
          },
          strong: {
            light: '#d2d5dc',
            dark: '#30343f',
          },
        },
        ink: {
          primary: {
            light: '#131518',
            dark: '#f1f2f4',
          },
          secondary: {
            light: '#5e636e',
            dark: '#8b909d',
          },
          muted: {
            light: '#9da2af',
            dark: '#585c67',
          },
        },
        brand: {
          DEFAULT: '#2563eb',
          dark: '#3b82f6',
        },
        priority: {
          high: '#e11d48',
          medium: '#d97706',
          low: '#10b981',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        serif: [
          'Newsreader',
          'Georgia',
          'Cambria',
          'serif',
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
};
