/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#2f81f7',
                    50: '#f0f7ff',
                    100: '#e0effe',
                    200: '#bae0fd',
                    300: '#7dc4fc',
                    400: '#38a8f8',
                    500: '#2f81f7',
                },
                success: '#238636',
                error: '#da3633',
                accent: '#bc8cff',
                dark: {
                    bg: '#010409',
                    card: '#0d1117',
                    hover: '#161b22',
                    border: '#30363d',
                    muted: '#7d8590',
                    text: '#e6edf3',
                }
            },
            fontFamily: {
                display: ['Outfit', 'sans-serif'],
                sans: ['Inter', 'sans-serif', 'ui-sans-serif', 'system-ui'],
            }
        },
    },
    plugins: [],
}
