import type { Movement } from "@src/core/movement/types"

export type PathInternals = {
	movements: Movement[]
}

export type PathOptions = {
	id: string
}
