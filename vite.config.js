import { resolve } from 'path'
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill"
import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
  build: {
    target: 'es2020'
  },
  define: {
    global: 'globalThis'
  },
  plugins: [sveltekit()],
  resolve: {
    alias: {
      $components: resolve('./src/components'),
      $routes: resolve('./src/routes')
    }
  },
  optimizeDeps: {
    include: ['ethers'],
    // Node.js global to browser globalThis
    define: {
      global: 'globalThis'
    },
    // Enable esbuild polyfill plugins
    esbuildOptions: {
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true
        })
      ]
    }
  }
}

export default config;
