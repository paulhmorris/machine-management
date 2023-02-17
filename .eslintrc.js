/** @type {import('@types/eslint').Linter.BaseConfig} */
module.exports = {
  root: true,
  extends: [
    "@remix-run/eslint-config",
    "@remix-run/eslint-config/node",
    "@remix-run/eslint-config/jest-testing-library",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier",
  ],
  env: {
    "cypress/globals": true,
  },
  plugins: ["cypress", "@typescript-eslint"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
  settings: {
    jest: {
      version: 28,
    },
  },
  rules: {
    "no-unused-vars": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/array-type": ["warn", { default: "array-simple" }],
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/consistent-type-imports": "warn",
    "@typescript-eslint/no-unsafe-return": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-namespace": ["error", { allowDeclarations: true }],
  },
};
