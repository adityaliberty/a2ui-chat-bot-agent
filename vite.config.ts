import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

/* -------------------------------------------------------------------------- */
/*                               ESM SAFE ROOT                                */
/* -------------------------------------------------------------------------- */

const __filename = fileURLToPath(import.meta.url);
const PROJECT_ROOT = path.dirname(__filename);

/* -------------------------------------------------------------------------- */
/*                                 VITE CONFIG                                 */
/* -------------------------------------------------------------------------- */

export default defineConfig({
  plugins: [react(), tailwindcss(), jsxLocPlugin()],

  resolve: {
    alias: {
      "@": path.resolve(PROJECT_ROOT, "client", "src"),
      "@shared": path.resolve(PROJECT_ROOT, "shared"),
      "@assets": path.resolve(PROJECT_ROOT, "attached_assets"),
    },
  },

  envDir: path.resolve(PROJECT_ROOT),

  root: path.resolve(PROJECT_ROOT, "client"),

  build: {
    outDir: path.resolve(PROJECT_ROOT, "dist", "public"),
    emptyOutDir: true,
  },

  server: {
    port: 3000,
    strictPort: false,
    host: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
