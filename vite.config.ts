import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  base: "/hammadshakeelai/",
  build: {
    chunkSizeWarningLimit: 1800,
    rollupOptions: {
      output: {
        manualChunks: { react: ["react", "react-dom"], motion: ["motion"] },
      },
    },
  },
});
