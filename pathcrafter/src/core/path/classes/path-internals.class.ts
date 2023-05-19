import NoStartingPoint from "@src/core/path/errors/no-starting-point.error"
import type { Point2dGetter, VectorProperties } from "@src/core/path/types"

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

		const startingPoint = this.start()
		const translatedFirst = first
			.clone()
			.translate(startingPoint.x, startingPoint.y)

		callback(translatedFirst, 0)

		let lastTranslatedHead = translatedFirst.getDisplacement().head

		for (const [i, item] of vectorProperties.entries()) {
			const translated = item
				.clone()
				.translate(lastTranslatedHead.x, lastTranslatedHead.y)

			lastTranslatedHead = translated.getDisplacement().head

			callback(translated, i + 1)
		}
	}

	clone() {
		const internals = new PathInternals()
		internals.vectors = [...this.vectors]
		internals.start = this.start
		return internals
	}
}

export default PathInternals
