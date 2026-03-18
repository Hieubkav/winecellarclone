import { defineConfig, globalIgnores } from "eslint/config";
import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = defineConfig([
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "test-performance-fixes.js",
    "performance-analysis.ts",
    "thien-kim-wine-redesign/**",
  ]),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
      "react-hooks/exhaustive-deps": "warn",
      "@next/next/no-img-element": "warn",
      "react/no-unescaped-entities": "warn",
    },
  },
  {
    files: [
      "app/(admin)/admin/**/*.ts",
      "app/(admin)/admin/**/*.tsx",
      "components/admin/**/*.ts",
      "components/admin/**/*.tsx",
      "components/providers/**/*.ts",
      "components/providers/**/*.tsx",
      "lib/hooks/**/*.ts",
      "lib/hooks/**/*.tsx",
      "lib/utils/**/*.ts",
      "lib/utils/**/*.tsx",
    ],
    rules: {
      "react-hooks/exhaustive-deps": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@next/next/no-img-element": "off",
      "react/no-unescaped-entities": "off",
    },
  },
]);

export default eslintConfig;
