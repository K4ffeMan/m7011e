import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
  },
  preview: {
    host: true,
    allowedHosts: [
      "https://frontend-dev.ltu-m7011e-7.se"
    ],
  }
});
