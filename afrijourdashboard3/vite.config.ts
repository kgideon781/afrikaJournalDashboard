import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"

/**
 * Splitting rules:
 * - React core stays isolated so it can be cached separately from feature libs.
 * - Radix + shadcn-style primitives share a chunk (many small pkgs, each only
 *   used by 1-2 components; grouping avoids waterfall).
 * - Charts + motion are heavy AND only used on analytics/dashboard pages;
 *   splitting them means routes that do not need charts do not pay for them.
 * - Icons split off because @tabler + lucide + react-icons together are ~90 KB.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return
          if (id.includes("react-router")) return "router"
          if (id.includes("react-dom") || id.match(/[\\/]node_modules[\\/]react[\\/]/)) return "react"
          if (id.includes("@radix-ui") || id.includes("cmdk") || id.includes("vaul")) return "radix"
          if (id.includes("recharts") || id.includes("d3-")) return "charts"
          if (id.includes("framer-motion")) return "motion"
          if (id.includes("@tabler/icons-react") || id.includes("lucide-react") || id.includes("react-icons")) return "icons"
          if (id.includes("react-hook-form") || id.includes("@hookform") || id.includes("zod")) return "forms"
          if (id.includes("@tanstack")) return "table"
          if (id.includes("date-fns") || id.includes("dayjs")) return "dates"
          if (id.includes("i18next") || id.includes("react-i18next")) return "i18n"
          if (id.includes("react-syntax-highlighter") || id.includes("refractor")) return "syntax"
          return "vendor"
        },
      },
    },
    chunkSizeWarningLimit: 500,
    sourcemap: false,
  },
})
