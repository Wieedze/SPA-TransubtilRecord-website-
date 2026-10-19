import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"

export default defineConfig({
  plugins: [react()],
  server: {
    // Pages Functions run under `npm run dev:api` (wrangler, port 8788)
    proxy: {
      "/api": "http://localhost:8788",
    },
  },
})
