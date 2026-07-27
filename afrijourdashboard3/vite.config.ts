import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"

/**
 * Chunking note (2026-07-27):
 * The prior manualChunks function split React into its own chunk, but a
 * library in the fallback `vendor` chunk was reading React.useLayoutEffect
 * before the react chunk finished initializing, causing a blank page.
 * Reverted to Vite's default chunking. Re-attempt with the deterministic
 * object form (manualChunks: { react: ['react','react-dom',...] }) if the
 * cache-split perf win is needed later.
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
    chunkSizeWarningLimit: 800,
    sourcemap: false,
  },
})
