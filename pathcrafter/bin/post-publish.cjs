const { existsSync, lstatSync, copyFileSync, unlinkSync } = require("fs")
const { join } = require("path")

const PACKAGE_JSON_DIR = join(__dirname, "..")
const BACKUP_EXTENSION = ".bk"

const packageJsonPath = join(PACKAGE_JSON_DIR, "package.json")
if (!existsSync(packageJsonPath) || !lstatSync(packageJsonPath).isFile()) {
	throw new Error("Missing or invalid `package.json`.")
}

const backupPath = `${packageJsonPath}${BACKUP_EXTENSION}`
if (!existsSync(backupPath) || !lstatSync(backupPath).isFile()) {
	throw new Error("Missing or invalid `package.json` backup.")
}

copyFileSync(backupPath, packageJsonPath)

unlinkSync(backupPath)
