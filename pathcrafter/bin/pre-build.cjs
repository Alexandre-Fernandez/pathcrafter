const { existsSync, lstatSync, copyFileSync } = require("fs")
const { join } = require("path")

const README = "README.md"
const PATHCRAFTER_DIR = join(__dirname, "..")
const MONOREPO_DIR = join(PATHCRAFTER_DIR, "..")

const readme = join(MONOREPO_DIR, README)
if (existsSync(readme) && lstatSync(readme).isFile()) {
	copyFileSync(readme, join(PATHCRAFTER_DIR, README))
}
