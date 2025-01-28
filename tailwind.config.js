const { transform } = require("next/dist/build/swc");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "custom-gradient":
          "linear-gradient(180deg, #FDC2A0 2%, #E7AA87 2.01%, #FFB48A 49%, #E77B3E 64%, #7E370F 100%)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",

        // Primary Colors
        primary: {
          50: "var(--primary-50)",
          100: "var(--primary-100)",
          200: "var(--primary-200)",
          300: "var(--primary-300)",
          400: "var(--primary-400)",
          500: "var(--primary-500)",
          600: "var(--primary-600)",
          700: "var(--primary-700)",
          800: "var(--primary-800)",
          900: "var(--primary-900)",
          950: "var(--primary-950)",
        },

        // Secondary Colors
        secondary: {
          50: "var(--secondary-50)",
          100: "var(--secondary-100)",
          200: "var(--secondary-200)",
          300: "var(--secondary-300)",
          400: "var(--secondary-400)",
          500: "var(--secondary-500)",
          600: "var(--secondary-600)",
          700: "var(--secondary-700)",
          800: "var(--secondary-800)",
          900: "var(--secondary-900)",
          950: "var(--secondary-950)",
        },

        // Text Colors
        text: {
          50: "var(--text-50)",
          100: "var(--text-100)",
          200: "var(--text-200)",
          300: "var(--text-300)",
          400: "var(--text-400)",
          500: "var(--text-500)",
          600: "var(--text-600)",
          700: "var(--text-700)",
          800: "var(--text-800)",
          900: "var(--text-900)",
          950: "var(--text-950)",
        },
      },
      keyframes: {
        slideInLeft: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        // Zoom out animation
        zoomIn: {
          "0%": { transform: "scale(0.1)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        // Slide from top right corner
        slideFromTopRight: {
          "0%": { transform: "translate(100%, -100%)", opacity: "0" },
          "100%": { transform: "translate(0, 0)", opacity: "1" },
        },
        // Slide up animation
        slideUp: {
          "0%": { transform: "translateY(40%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        // Fade in animation
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        // Slide down animation
        slideDown: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scrollText: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-300%)" },
        },
        growTop: {
          from: { height: "0px" },
          to: { height: "74px" },
        },
        growTopXL: {
          from: { height: "0px" },
          to: { height: "104px" },
        },
        shimmer: {
          '0%': { backgroundPosition: '-100% 0' },
          '100%': { backgroundPosition: '100% 0' },
        },
       
      },


        
      animation: {
        shimmer: 'shimmer 1.5s infinite linear',
        slideInLeft: "slideInLeft 1s ease-out forwards",
        zoomIn: "zoomIn 0.8s ease-in forwards",
        slideFromTopRight: "slideFromTopRight 0.8s ease-out forwards",
        slideUp: "slideUp 0.8s ease-out forwards",
        slideDown: "slideDown 0.8s ease-out forwards",
        fadeIn: "fadeIn 0.8s ease-in-out forwards",
        scrollText: "scrollText 8s linear infinite",
        growTop: "growTop 1s ease-in-out forwards",
        growBottom: "growTop 1s ease-in-out forwards 1s", // Delay the bottom animation
        growTopXL: "growTopXL 1s ease-in-out forwards",
        growBottomXL: "growTopXL 1s ease-in-out forwards 1s", // Delay the bottom animation
      },

    },
    container: {
      padding: {
        DEFAULT: "1rem",
      },
      center: true,
    },
  },
  plugins: [],
};



