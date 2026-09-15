import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react() as unknown as PluginOption, tailwindcss() as unknown as PluginOption],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
});