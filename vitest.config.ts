import path from "node:path";
import { defineConfig } from "vitest/config";

// Only mirrors the "@/*" -> "./*" path alias from tsconfig.json. These tests
// stick to pure logic (Zod schemas, no Next.js/React/Supabase runtime), so
// no plugin or DOM environment is needed.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
