import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: here,
  publicDir: path.join(here, "../public"), // so templates find their /public files, like in the Studio
  plugins: [react()],
  server: {
    port: 5180,
    // anything under these addresses goes to your server on port 4000
    proxy: {
      "/api": "http://localhost:4000",
      "/media": "http://localhost:4000",
      "/out": "http://localhost:4000",
    },
  },
});
