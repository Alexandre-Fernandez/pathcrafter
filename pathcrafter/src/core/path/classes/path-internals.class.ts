import type CubicVectorProperties from "@src/core/path/classes/vector-properties/cubic-vector-properties.class"
import type QuadraticVectorProperties from "@src/core/path/classes/vector-properties/quadratic-vector-properties.class"
import type StraightVectorProperties from "@src/core/path/classes/vector-properties/straight-vector-properties.class"
import NoStartingPoint from "@src/core/path/errors/no-starting-point.error"
import type { Point2dGetter } from "@src/core/path/types"

type VectorProperties =
	| StraightVectorProperties
	| CubicVectorProperties
	| QuadraticVectorProperties

class PathInternals {
	/** Array of position vectors (`tail.x === 0 && tail.y === 0`) getters. */
	vectors: VectorProperties[] = []

	start: Point2dGetter | null = null

	/** Each vector will be cloned and translated to begin where the previous finished. */
	forEachTranslatedVector(
		callback: (vector: VectorProperties, index: number) => any,
	) {
		if (!this.start) throw new NoStartingPoint()

		const [first, ...vectorProperties] = this.vectors
		if (!first) return

		const translatedFirst = first.clone().translate(this.start)

		callback(translatedFirst, 0)

		let previousHeadGetter = () => translatedFirst.getDisplacement().head
		for (const [i, item] of vectorProperties.entries()) {
			const translated = item.clone().translate(previousHeadGetter)

			previousHeadGetter = () => translated.getDisplacement().head

			callback(translated, i + 1)
		}
	}

	getTranslatedVectors() {
		const translatedVectors: VectorProperties[] = []
		this.forEachTranslatedVector((vector) => translatedVectors.push(vector))
		return translatedVectors
	}

	clone() {
		const internals = new PathInternals()
		internals.vectors = this.vectors.map((vector) => vector.clone())
		internals.start = this.start
		return internals
	}
}

export default PathInternals
