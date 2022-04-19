import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill"
import { defineConfig } from "vite"
import { svelte } from "@sveltejs/vite-plugin-svelte"


export default defineConfig({
  define: {
    global: "globalThis",
  },
  plugins: [
    svelte()
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