import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import unusedImportsPlugin from "eslint-plugin-unused-imports";

export default [
  {
    ignores: [
      "playwright-report/",
      "test-results/",
      "dist/",
      "build/",
      "logs/",
      ".temp/",
      ".tmp/",
      "code-review-output/",
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      import: importPlugin,
      "unused-imports": unusedImportsPlugin,
    },
    settings: {
      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"],
      },
      "import/resolver": {
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },
    rules: {
      // パスエイリアスの解決エラーを無効化（TypeScriptが既にチェック）
      "import/no-unresolved": "off",

      // 未使用importを自動削除
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      // import順序のルール
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
            "type",
          ],
          pathGroups: [
            {
              pattern: "@/fixtures/**",
              group: "internal",
              position: "before",
            },
            {
              pattern: "@/test-data/**",
              group: "internal",
              position: "before",
            },
            {
              pattern: "@/pages/**",
              group: "internal",
            },
            {
              pattern: "@/workflows/**",
              group: "internal",
            },
            {
              pattern: "@/utils/**",
              group: "internal",
              position: "after",
            },
            {
              pattern: "@/constants/**",
              group: "internal",
              position: "after",
            },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],

      // 重複importを禁止
      "import/no-duplicates": "error",
    },
  },
];
