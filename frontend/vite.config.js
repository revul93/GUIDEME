import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Your frontend port
    proxy: {
      "/api": {
        target: "http://localhost:5000", // ⬅️ CHANGE THIS to your backend port
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
