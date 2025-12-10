import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  // the host and port lines can allow vite to listen on all networks not jut on the same machine if running on a docker container.
  // Otherwise trying to talk from nginx or backend container to the frontend container can be a bitch. Same with package.json `dev` exposure
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: ["test.cirrostrats.us"],
  },
  plugins: [react()],

build: {
    // Defines the output directory (standard is 'dist')
    outDir: 'dist',
    rollupOptions: {
      output: {
        // This forces Vite to add a hash to every JS and CSS file it builds
        entryFileNames: `assets/[name].[hash].js`,
        chunkFileNames: `assets/[name].[hash].js`,
        assetFileNames: `assets/[name].[hash].[ext]`,
      },
    },
  },
  // ------------------------
});

