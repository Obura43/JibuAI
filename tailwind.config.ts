import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #071A2F 0%, #123C69 50%, #071A2F 100%)',
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #F0D060 100%)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        navy: { DEFAULT: '#071A2F', 50: '#E8EEF4', 100: '#C5D4E5', 200: '#8DAAC8', 300: '#5680AB', 400: '#2A568E', 500: '#071A2F', 600: '#061727', 700: '#05131F', 800: '#030D17', 900: '#02080F' },
        royal: { DEFAULT: '#123C69', 50: '#E6EEF5', 100: '#BCCFE5', 200: '#7EAACB', 300: '#4085B1', 400: '#1D6097', 500: '#123C69', 600: '#0F3259', 700: '#0C2849', 800: '#081E38', 900: '#051428' },
        gold: { DEFAULT: '#D4AF37', 50: '#FBF5DC', 100: '#F6EAB3', 200: '#EDD670', 300: '#E4C23D', 400: '#D4AF37', 500: '#B8952F', 600: '#9C7B27', 700: '#80611F', 800: '#644817', 900: '#483010' },
        emerald: { DEFAULT: '#0F9D58', 50: '#E3F5EC', 100: '#B3E7CE', 200: '#70D2A3', 300: '#2DBD79', 400: '#0FAF63', 500: '#0F9D58', 600: '#0D884C', 700: '#0B7340', 800: '#085E34', 900: '#064928' },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
