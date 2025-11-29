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
        border: "var(--color-border)",
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        primary: {
          DEFAULT: "var(--color-primary)",
          foreground: "var(--color-primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          foreground: "var(--color-secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--color-muted)",
          foreground: "var(--color-muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          foreground: "var(--color-accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--color-destructive)",
          foreground: "var(--color-destructive-foreground)",
        },
        ring: "var(--color-ring)",
        amber: {
          400: 'oklch(.828 .189 84.429)',
          500: 'oklch(.769 .188 70.08)',
          600: 'oklch(.666 .179 58.318)',
          700: 'oklch(.555 .163 48.998)',
          950: 'oklch(.279 .077 45.635)',
        },
        gray: {
          100: 'oklch(.967 .003 264.542)',
          300: 'oklch(.872 .01 258.338)',
          400: 'oklch(.707 .022 261.325)',
          500: 'oklch(.551 .027 264.364)',
        },
        zinc: {
          700: 'oklch(.37 .013 285.805)',
          800: 'oklch(.274 .006 286.033)',
          900: 'oklch(.21 .006 285.885)',
        },
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
      },
    },
  },
  plugins: [],
};
export default config;

