import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill"
import { defineConfig } from "vite"
import elmPlugin from "vite-plugin-elm"


export default defineConfig({
  define: {
    global: "globalThis",
  },
  plugins: [
    elmPlugin()
  ],
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
        }),
      ],
    },
  }
})