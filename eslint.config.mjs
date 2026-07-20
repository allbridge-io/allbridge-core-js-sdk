import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import _import from "eslint-plugin-import";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [
      "scripts/*",
      "**/esbuild-hook.js",
      "src/services/models/sui/*",
      "src/services/models/srb/*",
    ],
  },
  ...fixupConfigRules(
    compat.extends(
      "eslint:recommended",
      "plugin:eslint-comments/recommended",
      "plugin:@typescript-eslint/eslint-recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:@typescript-eslint/recommended-requiring-type-checking",
      "plugin:@typescript-eslint/strict",
      "plugin:import/recommended",
      "plugin:import/typescript",
      "prettier"
    )
  ),
  {
    plugins: {
      import: fixupPluginRules(_import),
      "@typescript-eslint": fixupPluginRules(typescriptEslint),
    },

    languageOptions: {
      globals: {
        ...globals.node,
      },

      parser: tsParser,
      ecmaVersion: 5,
      sourceType: "commonjs",

      parserOptions: {
        project: "./tsconfig.lint.json",
      },
    },

    settings: {
      "import/resolver": {
        typescript: {
          project: "tsconfig.json",
        },
      },
    },

    rules: {
      "import/order": [
        "error",
        {
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],

      "import/no-extraneous-dependencies": "error",
      "import/no-mutable-exports": "error",
      "import/no-unused-modules": "error",

      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^ignore",
        },
      ],

      "eslint-comments/no-unlimited-disable": "off",
      "eslint-comments/disable-enable-pair": "off",
      "@typescript-eslint/ban-tslint-comment": "off",
      "@typescript-eslint/ban-ts-comment": [
        "warn",
        {
          minimumDescriptionLength: 3,
        },
      ],

      // Newly added to eslint:recommended in ESLint v10; not part of this
      // project's intended ruleset and produces false positives on exported
      // consts and intentional undefined test fixtures.
      "no-unassigned-vars": "off",
      "no-useless-assignment": "off",

      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];
