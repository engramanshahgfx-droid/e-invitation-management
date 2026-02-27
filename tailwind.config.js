/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'var(--color-border)', /* primary with opacity */
        input: 'var(--color-input)', /* primary with opacity */
        ring: 'var(--color-ring)', /* Deep professional blue */
        background: 'var(--color-background)', /* Soft off-white */
        foreground: 'var(--color-foreground)', /* near-black */
        primary: {
          DEFAULT: 'var(--color-primary)', /* Deep professional blue */
          foreground: 'var(--color-primary-foreground)', /* white */
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)', /* Lighter blue */
          foreground: 'var(--color-secondary-foreground)', /* white */
        },
        accent: {
          DEFAULT: 'var(--color-accent)', /* Warm gold */
          foreground: 'var(--color-accent-foreground)', /* near-black */
        },
        destructive: {
          DEFAULT: 'var(--color-destructive)', /* Clear red */
          foreground: 'var(--color-destructive-foreground)', /* white */
        },
        success: {
          DEFAULT: 'var(--color-success)', /* Professional green */
          foreground: 'var(--color-success-foreground)', /* white */
        },
        warning: {
          DEFAULT: 'var(--color-warning)', /* Warm orange */
          foreground: 'var(--color-warning-foreground)', /* white */
        },
        error: {
          DEFAULT: 'var(--color-error)', /* Clear red */
          foreground: 'var(--color-error-foreground)', /* white */
        },
        muted: {
          DEFAULT: 'var(--color-muted)', /* slate-100 */
          foreground: 'var(--color-muted-foreground)', /* Medium gray */
        },
        card: {
          DEFAULT: 'var(--color-card)', /* white */
          foreground: 'var(--color-card-foreground)', /* Rich dark blue-gray */
        },
        popover: {
          DEFAULT: 'var(--color-popover)', /* white */
          foreground: 'var(--color-popover-foreground)', /* Rich dark blue-gray */
        },
        text: {
          primary: 'var(--color-text-primary)', /* Rich dark blue-gray */
          secondary: 'var(--color-text-secondary)', /* Medium gray */
        },
      },
      borderRadius: {
        sm: 'var(--radius-sm)', /* 6px */
        md: 'var(--radius-md)', /* 12px */
        lg: 'var(--radius-lg)', /* 18px */
        xl: 'var(--radius-xl)', /* 24px */
      },
      fontFamily: {
        heading: ['Crimson Pro', 'serif'],
        body: ['Source Sans 3', 'sans-serif'],
        caption: ['Nunito Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      boxShadow: {
        'warm-sm': 'var(--shadow-sm)',
        'warm-md': 'var(--shadow-md)',
        'warm-lg': 'var(--shadow-lg)',
        'warm-xl': 'var(--shadow-xl)',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      ringWidth: {
        '3': '3px',
      },
      ringOffsetWidth: {
        '3': '3px',
      },
      zIndex: {
        '1': '1',
        '50': '50',
        '100': '100',
        '200': '200',
        '300': '300',
        '999': '999',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'slide-in': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slide-in 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'slide-up': 'slide-up 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
    },
  },
  plugins: [],
}