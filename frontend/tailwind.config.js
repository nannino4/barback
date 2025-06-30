/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Custom font families from our design system
      fontFamily: {
        heading: ['Playfair Display', 'Times New Roman', 'serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      
      // Custom breakpoints for mobile-first design
      screens: {
        'tablet': '768px',
        'desktop': '1024px', 
        'large': '1440px',
      },
      
      // Touch target spacing
      spacing: {
        'touch': '2.75rem', // 44px minimum touch target
      },
      
      // Touch target heights
      height: {
        'touch': '2.75rem', // 44px minimum touch target
      },
    },
  },
}
