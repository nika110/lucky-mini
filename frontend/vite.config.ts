import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  console.log(env.VITE_APP_URL)
  return {
    plugins: [react(), tsconfigPaths(), nodePolyfills()],
    server: {
      port: 3100,
      allowedHosts: [env.VITE_APP_URL.replace("https://", "")], // Replace ALLOWED_HOST with your actual env variable name
    },
    assetsInclude: ["**/*.ttf"],
  };
});