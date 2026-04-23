import type { Config } from "tailwindcss";

export default {
  theme: {
    extend: {
      animation: {
        // Fade animations
        "fade-in": "fadeIn 0.6s ease-in-out",
        "fade-out": "fadeOut 0.6s ease-in-out",
        
        // Slide animations
        "slide-up": "slideUp 0.6s ease-out",
        "slide-down": "slideDown 0.6s ease-out",
        "slide-left": "slideLeft 0.6s ease-out",
        "slide-right": "slideRight 0.6s ease-out",
        
        // Scale animations
        "scale-in": "scaleIn 0.5s ease-out",
        "scale-up": "scaleUp 0.4s ease-out",
        
        // Bounce animations
        "bounce-in": "bounceIn 0.6s ease-out",
        
        // Pulse and shimmer
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "shimmer": "shimmer 2s infinite",
        
        // Parallax-like effect
        "float": "float 3s ease-in-out infinite",
      },
      keyframes: {
        // Fade keyframes
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        
        // Slide keyframes
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideLeft: {
          "0%": { transform: "translateX(20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideRight: {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        
        // Scale keyframes
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        scaleUp: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.05)" },
        },
        
        // Bounce keyframes
        bounceIn: {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { opacity: "1" },
          "70%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        
        // Pulse glow keyframes
        pulseGlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        
        // Shimmer keyframes
        shimmer: {
          "0%": { 
            backgroundPosition: "200% center",
          },
          "100%": { 
            backgroundPosition: "-200% center",
          },
        },
        
        // Float keyframes (parallax-like)
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      transitionDelay: {
        0: "0ms",
        100: "100ms",
        200: "200ms",
        300: "300ms",
        400: "400ms",
        500: "500ms",
      },
      transitionDuration: {
        250: "250ms",
        350: "350ms",
        400: "400ms",
        500: "500ms",
      },
      animationDelay: {
        0: "0ms",
        100: "100ms",
        200: "200ms",
        300: "300ms",
        400: "400ms",
        500: "500ms",
        600: "600ms",
        700: "700ms",
        "from-var": "var(--animation-delay, 0ms)",
      },
    },
  },
  plugins: [],
} satisfies Config;
