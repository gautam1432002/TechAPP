import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        playfair: ['Playfair Display', 'serif'],
      },
      colors: {
        border: 'hsl(217 33% 18%)',
        input: 'hsl(217 33% 18%)',
        ring: 'hsl(214 100% 60%)',
        background: {
          DEFAULT: 'hsl(222 47% 7%)',
          secondary: 'hsl(215 39% 11%)',
        },
        foreground: 'hsl(210 40% 98%)',
        primary: {
          DEFAULT: 'hsl(214 100% 60%)',
          glow: 'hsl(214 100% 70%)',
          foreground: 'hsl(210 40% 98%)',
        },
        secondary: {
          DEFAULT: 'hsl(262 80% 65%)',
          glow: 'hsl(262 90% 75%)',
          foreground: 'hsl(210 40% 98%)',
        },
        accent: {
          DEFAULT: 'hsl(329 100% 65%)',
          glow: 'hsl(329 100% 75%)',
          foreground: 'hsl(210 40% 98%)',
        },
        winner: {
          DEFAULT: 'hsl(45 100% 50%)',
          glow: 'hsl(45 100% 60%)',
          foreground: 'hsl(222 47% 7%)',
          gold: '#D4AF37',
          darkGold: '#AA8C2C',
        },
        destructive: {
          DEFAULT: 'hsl(0 84% 60%)',
          foreground: 'hsl(210 40% 98%)',
        },
        muted: {
          DEFAULT: 'hsl(215 39% 11%)',
          foreground: 'hsl(215 20% 65%)',
        },
        glass: 'rgba(255,255,255,0.05)',
        'glass-border': 'rgba(255,255,255,0.10)',
        'glass-hover': 'rgba(255,255,255,0.10)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, hsl(214 100% 60%), hsl(262 80% 65%))',
        'gradient-accent': 'linear-gradient(135deg, hsl(262 80% 65%), hsl(329 100% 65%))',
        'gradient-hero': 'linear-gradient(135deg, hsl(222 47% 7%), hsl(215 39% 11%))',
        'gradient-winner': 'linear-gradient(135deg, hsl(45 100% 50%), hsl(45 100% 60%))',
      },
      boxShadow: {
        glow: '0 0 40px hsl(214 100% 60% / 0.3)',
        'glow-secondary': '0 0 40px hsl(262 80% 65% / 0.3)',
        'glow-winner': '0 0 40px hsl(45 100% 50% / 0.4)',
      },
    },
  },
  plugins: [],
};

export default config;
