/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                bgVoid: '#060610',
                bgPrimary: '#0B0D17',
                bgSurface: '#121526',
                gold: {
                    300: '#E8C77A',
                    400: '#D4B06A',
                    500: '#C39B57',
                }
            },
            fontFamily: {
                serif: ['"Cormorant Garamond"', 'serif'],
                sans: ['Outfit', '"IBM Plex Sans Arabic"', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
            },
        },
    },
    plugins: [],
}