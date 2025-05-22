/** @type {import('tailwindcss').Config} */
export const content = [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
];
export const theme = {
    extend: {},
};
export const plugins = [];
export const corePlugins = {
    preflight: false, // ← Disable Tailwind's reset to avoid CSS conflicts
};