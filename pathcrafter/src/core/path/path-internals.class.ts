import type { Point2dGetter, VectorProperties } from "@src/core/path/types"

class PathInternals {
	vectors: VectorProperties[] = [] // position vectors

	start: Point2dGetter | null = null

	clone() {
		const internals = new PathInternals()
		internals.vectors = [...this.vectors]
		internals.start = this.start
		return internals
	}
}

export default PathInternals
