import type CubicVectorProperties from "@src/core/path/classes/cubic-vector-properties.class"
import type QuadraticVectorProperties from "@src/core/path/classes/quadratic-vector-properties.class"
import type StraightVectorProperties from "@src/core/path/classes/straight-vector-properties.class"
import type { Point2dGetter } from "@src/core/path/types"

export type PathInternalsVectorProperties =
	| StraightVectorProperties
	| CubicVectorProperties
	| QuadraticVectorProperties

class PathInternals {
	vectorProperties: PathInternalsVectorProperties[] = [] // position vectors

	start: Point2dGetter | null = null

	clone() {
		const internals = new PathInternals()
		internals.vectorProperties = [...this.vectorProperties]
		internals.start = this.start
		return internals
	}
}

export default PathInternals
