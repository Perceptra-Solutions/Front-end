import tailwindcssAnimate from 'tailwindcss-animate'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '1.5rem', screens: { '2xl': '1600px' } },
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['"Space Grotesk"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'Menlo', 'Consolas', 'monospace'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        /* identidade CONSTRUCT AI */
        navy: {
          50: '#EAF0F7',
          100: '#C7D6E6',
          200: '#9CB3CB',
          950: '#071726',
          900: '#0B2136',
          800: '#0F2740',
          700: '#143454',
          600: '#1B4570',
          500: '#22588C',
        },
        technical: {
          700: '#0F5FA6',
          600: '#1567B3',
          500: '#1E7FD0',
          400: '#3B9AE1',
          300: '#7FBFEE',
          100: '#E4F0FA',
        },
        graphite: {
          900: '#161D26',
          700: '#2C3742',
          500: '#5B6875',
          400: '#7C8996',
          300: '#A9B4BF',
          200: '#D3DAE1',
          100: '#E7ECF1',
          50: '#F4F6F9',
        },
        status: {
          critical: '#C8322B',
          'critical-bg': '#FCEDEC',
          warning: '#C97A0E',
          'warning-bg': '#FDF3E3',
          success: '#1B8A54',
          'success-bg': '#E8F5EE',
          info: '#1567B3',
          'info-bg': '#E8F1FA',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        panel: '0 1px 2px rgba(11, 33, 54, 0.05), 0 8px 24px rgba(11, 33, 54, 0.06)',
        raised: '0 2px 4px rgba(11, 33, 54, 0.06), 0 12px 32px rgba(11, 33, 54, 0.10)',
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'pulse-alert': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(200, 50, 43, 0.55)' },
          '70%': { boxShadow: '0 0 0 10px rgba(200, 50, 43, 0)' },
        },
        'pulse-live': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-alert': 'pulse-alert 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-live': 'pulse-live 1.6s ease-in-out infinite',
        'scan-line': 'scan-line 4s linear infinite',
        'fade-up': 'fade-up 0.25s ease-out',
      },
    },
  },
  plugins: [tailwindcssAnimate],
}
