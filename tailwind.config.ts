import type { Config } from 'tailwindcss'
import { colors, radius } from './src/styles/tokens'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { brand: colors },
      borderRadius: { sm: radius.sm, lg: radius.lg },
      keyframes: {
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
    },
  },
  plugins: [],
} satisfies Config
