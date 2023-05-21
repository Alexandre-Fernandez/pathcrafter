import Point2d from "@lib/geometry/2d/point2d.class"
import Vector2d from "@lib/geometry/2d/vector2d.class"
import EmptyVectors from "@src/core/path/errors/empty-vectors.error"
import NoStartingPoint from "@src/core/path/errors/no-starting-point.error"
import ParallelPreviousDisplacement from "@src/core/path/errors/parallel-previous-displacement.error"
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

	getParallel(gap: number) {
		const parallel = new PathInternals()
		parallel.start = this.#getParallelStart(gap)

		let previousVector: VectorProperties | null = null
		this.forEachTranslatedVector((vector) => {
			const getDisplacement = () => {
				if (!previousVector) throw new ParallelPreviousDisplacement()
				const previous = previousVector.getDisplacement()

				const combined = new Vector2d(
					previous.tail,
					vector.getDisplacement().head,
				).toLine2d()

				if (combined.intersects(previous.toLine2d())) {
					// if they intersect we substract the gap to the length
					return ""
				}

				return previous
			}

			previousVector = vector
		})

		return parallel
	}

	/** "Perpendicular point" to the starting point spaced by `gap` */
	#getParallelStart(gap: number): Point2dGetter {
		return () => {
			if (!this.start) throw new NoStartingPoint()

			const startingPoint = this.start()
			const firstVector = this.vectors
				.at(0)
				?.getDisplacement()
				.clone()
				.translate(startingPoint.x, startingPoint.y)

			if (!firstVector) throw new EmptyVectors()

			const length = firstVector.length()

			return new Point2d(
				startingPoint.x -
					(gap * (firstVector.head.y - startingPoint.y)) / length,
				startingPoint.y +
					(gap * (firstVector.head.x - startingPoint.x)) / length,
			)
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
