/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
<<<<<<< HEAD
  theme: {
    extend: {
      colors: {
        // Grounded in the system itself: near-black platform/tunnel tone,
        // the safety yellow used on platform edges & signage, and the
        // actual red/green used on line signage for service status.
        ink: {
          DEFAULT: "#0B0D10",
          panel: "#16191E",
          line: "#282D34",
        },
        signal: {
          DEFAULT: "#FCCC0A", // MTA platform-edge / bulletin yellow
          dim: "#8A7300",
        },
        service: {
          go: "#00933C", // IRT green — "operational"
          stop: "#EE352E", // 1/2/3 red — "out of service"
          unknown: "#A7A9AC", // L train grey — "unknown"
        },
      },
      fontFamily: {
        sans: [
          "Helvetica Neue",
          "Inter",
          "-apple-system",
          "system-ui",
          "Arial",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
=======
  theme: { extend: {} },
>>>>>>> 3b2721e5055772c6e4d92bd61fd7854c779af0b4
  plugins: [],
};
