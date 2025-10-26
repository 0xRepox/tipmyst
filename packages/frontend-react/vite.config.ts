// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    dedupe: ['react', 'react-dom']
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      external: ['@zama-fhe/relayer-sdk'], // Don't bundle RelayerSDK
    }
  },
  optimizeDeps: {
    exclude: ['@zama-fhe/relayer-sdk'] // Don't pre-bundle
  }
})