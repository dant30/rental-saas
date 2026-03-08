import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@components/ui": fileURLToPath(new URL("./src/components/shared", import.meta.url)),
      "@components": fileURLToPath(new URL("./src/components", import.meta.url)),
      "@contexts": fileURLToPath(new URL("./src/core/contexts", import.meta.url)),
      "@utils": fileURLToPath(new URL("./src/core/utils", import.meta.url)),
    },
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
  },
});
