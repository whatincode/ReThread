// ============================================================
// Shared Tailwind CDN config.
// Load this AFTER the Tailwind CDN <script> tag on every page,
// so every page uses the same brand colors and fonts.
//   ink          — main text color
//   cotton       — page background
//   cotton-dark  — cards, inputs, subtle surfaces
//   indigo       — denim accent (links, brand labels)
//   rust         — CTA / stitch accent
//   moss         — circular / upcycled accent
// ============================================================
tailwind.config = {
  theme: {
    extend: {
      colors: {
        ink: "#1e1a16",
        cotton: "#ede6d8",
        "cotton-dark": "#e2dac8",
        indigo: "#2b3a55",
        rust: "#b65a34",
        moss: "#5c6e4a",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(30,26,22,0.06), 0 1px 1px rgba(30,26,22,0.04)",
        card: "2px 3px 0 rgba(30,26,22,0.08)",
        "card-hover": "3px 6px 0 rgba(30,26,22,0.12)",
        panel: "0 1px 3px rgba(30,26,22,0.06), 0 12px 32px -12px rgba(30,26,22,0.18)",
        "panel-lg": "0 24px 60px -20px rgba(30,26,22,0.28)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        "fade-up": {
          "0%": { opacity: 0, transform: "translateY(6px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.4s ease-in-out infinite",
        "fade-up": "fade-up 0.35s ease-out",
      },
    },
  },
};
