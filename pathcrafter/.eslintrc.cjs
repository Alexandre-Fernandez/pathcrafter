module.exports = {
	extends: ["af-typescript"],
	parserOptions: {
		project: "./tsconfig.json",
		tsconfigRootDir: __dirname,
	},
	rules: {
		"no-bitwise": "off",
	},
}
