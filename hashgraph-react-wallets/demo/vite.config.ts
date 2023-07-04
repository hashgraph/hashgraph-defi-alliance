import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/hashgraph-react-wallets/',
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  build: {
    sourcemap: true
  }
})
