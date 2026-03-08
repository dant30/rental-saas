import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const require = createRequire(import.meta.url);
const reactPath = path.dirname(require.resolve("react/package.json"));
const reactDomPath = path.dirname(require.resolve("react-dom/package.json"));

export default defineConfig({
  plugins: [react()],
  resolve: {
    preserveSymlinks: false,
    dedupe: ["react", "react-dom"],
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@components/ui": fileURLToPath(new URL("./src/components/shared", import.meta.url)),
      "@components": fileURLToPath(new URL("./src/components", import.meta.url)),
      "@contexts": fileURLToPath(new URL("./src/core/contexts", import.meta.url)),
      "@utils": fileURLToPath(new URL("./src/core/utils", import.meta.url)),
      react: reactPath,
      "react-dom": reactDomPath,
      "react/jsx-runtime": path.join(reactPath, "jsx-runtime.js"),
      "react/jsx-dev-runtime": path.join(reactPath, "jsx-dev-runtime.js"),
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    hmr: {
      host: "localhost",
      protocol: "ws",
      port: 5173,
      clientPort: 5173,
    },
    proxy: {
      "/api": {
        target: process.env.VITE_API_BASE_URL?.replace(/\/api$/, "") || "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, "/");

          if (normalizedId.includes("/src/features/dashboard/")) return "dashboard";
          if (normalizedId.includes("/src/features/payments/")) return "payments";
          if (
            normalizedId.includes("/src/features/auth/") ||
            normalizedId.includes("/src/features/admin/") ||
            normalizedId.includes("/src/features/notifications/")
          ) {
            return "account";
          }
          if (normalizedId.includes("/src/features/caretakers/")) return "operations";
          if (normalizedId.includes("/node_modules/")) return "vendor";

          return undefined;
        },
      },
    },
  },
});
