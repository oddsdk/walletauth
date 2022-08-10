import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill"
import { defineConfig } from "vite"
// import elmPlugin from "vite-plugin-elm"
import reactPlugin from "@vitejs/plugin-react"

export default defineConfig({
  define: {
    global: "globalThis",
  },
  plugins: [reactPlugin()],
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
        }),
      ],
    },
  },
});
