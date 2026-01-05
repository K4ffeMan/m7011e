import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: [
      "frontend-dev.ltu-m7011e-7.se"
    ],
    proxy: {
      "/api": {
        target: "http://backend:5000", // your backend URL
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    host: true,
    allowedHosts: [
      "frontend-dev.ltu-m7011e-7.se",
    ],
  },
});
