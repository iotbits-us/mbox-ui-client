import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "MBoxUIClient",
      fileName: "mbox-ui-client",
    },
  },
  resolve: {
    alias: {
      $types: resolve(__dirname, "src/types/index.ts"),
    },
  },
});
