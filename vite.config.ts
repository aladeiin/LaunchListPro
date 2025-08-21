import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Make the config ASYNC so we can await dynamic imports safely
export default defineConfig(async ({ mode }) => {
  const plugins = [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
  ];

  // Load the Replit cartographer plugin only during non-production + when running on Replit
  if (mode !== "production" && process.env.REPL_ID !== undefined) {
    const { cartographer } = await import("@replit/vite-plugin-cartographer");
    plugins.push(cartographer());
  }

  return {
    plugins,
    // Vite project root is the /client folder
    root: path.resolve(__dirname, "client"),
    // IMPORTANT: build to client/dist (NOT repo/dist/public)
    build: {
      outDir: path.resolve(__dirname, "client", "dist"),
      emptyOutDir: true,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"),
        // lets the client import from ../shared if you use shared TS types
        "@shared": path.resolve(__dirname, "shared"),
      },
    },
  };
});
