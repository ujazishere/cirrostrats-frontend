import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // the host and port lines can allow vite to listen on all networks not jut on the same machine if running on a docker container.
    // Otherwise trying to talk from nginx or backend container to the frontend container can be a bitch. Same with package.json `dev` exposure
  server:{
    host: '0.0.0.0',
    port: 5173,
  },
    plugins: [react()],
})
