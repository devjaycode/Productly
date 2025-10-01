/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                error: "#FF5252",
                success: "#12B76A",
                warning: "#FFC107",
                info: "#2196F3",
                primary: "#137fec",
                "background-light": "#f6f7f8",
            },

            borderRadius: { DEFAULT: "0.25rem", lg: "0.5rem", xl: "0.75rem", full: "9999px" },
        },
    },
    plugins: [],
};
