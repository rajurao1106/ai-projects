/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./app/**/*.{js,ts,jsx,tsx}", // ✅ For App Router (Next.js 13+)
      "./pages/**/*.{js,ts,jsx,tsx}", // ✅ For Pages Router
      "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  };
  