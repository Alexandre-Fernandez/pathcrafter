import type { Movement } from "@src/core/movement/types"
import type Path from "@src/core/path/classes/path.class"

export type PathInternals = {
	movements: Movement[]
	parent: Path | null
}

export type PathOptions = {
	id: string
}
