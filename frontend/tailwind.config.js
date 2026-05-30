export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#161616",
        paper: "#f7f7f4",
        brand: "#0f766e",
        coral: "#e85d4f",
        grape: "#6d5dfc"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(22, 22, 22, 0.08)"
      }
    }
  },
  plugins: []
};
