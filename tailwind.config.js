/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // LeetCode-inspired maritime theme
                'charcoal': '#1A1A1A',
                'dark-gray': '#262626',
                'orange-accent': '#FFA116',
                'off-white': '#E8E8E8',
                'muted-gray': '#A0A0A0',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'Courier New', 'monospace'],
            },
        },
    },
    plugins: [],
}
