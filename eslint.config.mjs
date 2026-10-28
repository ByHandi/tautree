import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { FlatCompat } from "@eslint/eslintrc";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import sonarjs from "eslint-plugin-sonarjs";
import { defineConfig, globalIgnores } from "eslint/config";

const __dirname = dirname(fileURLToPath(import.meta.url));

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = defineConfig([
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  eslintConfigPrettier,
  {
    rules: {
      "sort-imports": "off",
      "import/order": "off",
    },
  },
  // Keep functions small enough to follow at a glance (same limits as Ostra's dashboard).
  // Split a function into well-named helpers instead of raising a limit.
  {
    plugins: { sonarjs },
    rules: {
      complexity: ["error", 15],
      "sonarjs/cognitive-complexity": ["error", 15],
    },
  },
  // shadcn primitives and the form wrappers built on them: `complexity` counts every prop
  // default and `?.`, so only cognitive complexity applies here.
  {
    files: ["components/ui/**"],
    rules: {
      complexity: "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated Prisma client (`prisma generate`).
    "lib/generated/**",
  ]),
]);

export default eslintConfig;
