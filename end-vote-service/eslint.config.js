// CommonJS ESLint config for the backend (TypeScript + Node)

module.exports = {
	root: true,
	env: {
		node: true,
		es2021: true,
	},
	parser: "@typescript-eslint/parser",
	parserOptions: {
		project: "./tsconfig.json",
		tsconfigRootDir: __dirname,
		sourceType: "module",
	},
	plugins: ["@typescript-eslint", "perfectionist"],
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:@typescript-eslint/recommended-requiring-type-checking",
		"plugin:perfectionist/recommended",
	],
	rules: {
		// Example rules — adjust to taste
		"@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
		"perfectionist/sort-objects": "warn",
	},
	ignorePatterns: ["dist", "node_modules"],
};
