/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          0: '#050609',
          1: '#0a0c10',
          2: '#101318',
          3: '#171b22',
          4: '#1f242c',
          5: '#2a3038',
        },
        silver: {
          DEFAULT: '#b8c0cc',
          bright: '#e4e8ee',
          pure: '#ffffff',
          deep: '#8a94a4',
          dark: '#5e6675',
        },
        bone: {
          DEFAULT: '#e8ecf2',
          2: '#cdd4de',
          muted: '#8a94a4',
          faint: '#5e6675',
        },
        steel: '#6b7788',
        graphite: '#3d434e',
      },
      fontFamily: {
        display: ['Fraunces', 'Calibri', 'Iowan Old Style', 'Palatino', 'Georgia', 'serif'],
        sans: ['Calibri', 'Carlito', '"Segoe UI"', '"Inter Tight"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'SF Mono', 'Menlo', 'monospace'],
      },
      borderRadius: {
        'feature': '20px',
        'showcase': '24px',
        'cta': '32px',
        'pill': '100px',
        'stat': '12px',
      },
      boxShadow: {
        'soft': '0 1px 2px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)',
        'deep': '0 30px 70px rgba(0, 0, 0, 0.7)',
        'silver-glow': '0 20px 60px rgba(184, 192, 204, 0.15)',
        'metallic-inset': 'inset 0 1px 1px 0 rgba(228, 232, 238, 0.12), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.5)',
      },
      backgroundImage: {
        'grad-silver': 'linear-gradient(135deg, #e4e8ee 0%, #b8c0cc 40%, #8a94a4 75%, #5e6675 100%)',
        'grad-silver-bright': 'linear-gradient(135deg, #ffffff 0%, #e4e8ee 25%, #b8c0cc 55%, #8a94a4 100%)',
      },
    },
  },
  plugins: [],
}
