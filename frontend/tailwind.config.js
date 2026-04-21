/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                heading: ['Space Grotesk', 'sans-serif'],
            },
            colors: {
                background: '#1a2a1a',  // Deep Forest Green
                surface: '#243424',     // Slightly lighter forest
                primary: {
                    DEFAULT: '#8a9a5b', // Sage Green
                    dark: '#5c6b3d',
                    light: '#b6c695',
                },
                accent: {
                    DEFAULT: '#e2725b', // Terracotta
                    hover: '#c55845',
                },
                highlight: '#eab308', // Muted Orange/Yellow
                text: {
                    main: '#f5f5dc',  // Cream
                    muted: '#8a9a5b', // Sage
                }
            },
            boxShadow: {
                glow: '0 0 20px rgba(168, 85, 247, 0.3)',
                neon: '0 0 10px rgba(6, 182, 212, 0.5), 0 0 20px rgba(6, 182, 212, 0.3)',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            },
            keyframes: {
                'scroll-y': {
                    '0%': { transform: 'translateY(0)' },
                    '100%': { transform: 'translateY(-50%)' },
                }
            },
            animation: {
                'scroll-y': 'scroll-y 20s linear infinite',
                'text-shimmer': 'text-shimmer 3s linear infinite',
            }
        },
    },
    plugins: [],
}
