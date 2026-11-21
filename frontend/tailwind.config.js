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
          light: '#f5f7f4',
          dark: '#0c100e',
        },
        surface: {
          light: '#ffffff',
          dark: '#131916',
          muted: {
            light: '#ecf1eb',
            dark: '#18211c',
          },
        },
        border: {
          subtle: {
            light: '#e1e7e0',
            dark: '#1f2823',
          },
          strong: {
            light: '#c8d3c6',
            dark: '#2c3931',
          },
        },
        ink: {
          primary: {
            light: '#131915',
            dark: '#eef3ef',
          },
          secondary: {
            light: '#47564d',
            dark: '#93a398',
          },
          muted: {
            light: '#7e9085',
            dark: '#586b60',
          },
        },
        matcha: {
          50: '#f3f7f4',
          100: '#e3eee5',
          200: '#c6ddcc',
          300: '#9ec4a7',
          400: '#6ea67c',
          500: '#488858',
          600: '#346c43',
          700: '#295435',
          800: '#23442c',
          900: '#1e3825',
          DEFAULT: '#295435',
          dark: '#52a472',
        },
        brand: {
          DEFAULT: '#295435',
          dark: '#52a472',
          light: '#346c43',
          tint: '#eaf2ec',
          tintDark: '#16281e',
        },
        priority: {
          high: '#b91c1c',
          medium: '#b45309',
          low: '#295435',
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
