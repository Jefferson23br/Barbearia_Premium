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
    },
  },
  plugins: [],
};
export default config;

