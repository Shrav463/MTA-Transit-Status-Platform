import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "MTA Transit Status",
        short_name: "MTA Status",
        description: "Check elevator/escalator status and plan routes.",
        start_url: "/",
        scope: "/",
        display: "standalone",
<<<<<<< HEAD
        background_color: "#0f172a",
        theme_color: "#0ea5e9",
=======
        background_color: "#07080c",
        theme_color: "#ff6b00",
>>>>>>> 3b2721e5055772c6e4d92bd61fd7854c779af0b4
        icons: [
          { src: "/pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/pwa-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      },
      workbox: {
        // IMPORTANT: makes react-router routes work when opening from home screen
        navigateFallback: "/index.html",
      },
    }),
  ],
});