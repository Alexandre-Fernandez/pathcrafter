import Path from "@src/core/path/classes/path.class"

export function isPath(path: unknown): path is Path {
	return path instanceof Path
}
