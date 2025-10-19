/** @type {import('tailwindcss').Config} */
export default {
  // This content array tells Tailwind which files to scan for class names.
  // It is essential for your project.
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  // This enables the dark mode to be toggled manually, which we set up for the dashboard.
  darkMode: "class",

  theme: {
    extend: {
      // Your custom color theme definitions
      colors: {
        "primary-teal": "#00575C",
        "secondary-green": "#6CC3A0",
        "accent-orange": "#F39C12",
        "light-bg": "#F9FAFB",
        "dark-text": "#1F2937",
      },
    },
  },

  // Add any Tailwind plugins here.
  plugins: [],
};
