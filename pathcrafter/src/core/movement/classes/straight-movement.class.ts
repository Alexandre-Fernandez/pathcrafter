import Point2d from "@lib/geometry/2d/point2d.class"
import type { Coordinates2d } from "@lib/geometry/2d/types"
import Vector2d from "@lib/geometry/2d/vector2d.class"
import type { Movement } from "@src/core/movement/types"
import type {
	Coordinates2dGetter,
	Point2dGetter,
	Vector2dGetter,
} from "@src/types"

class StraightMovement {
	constructor(
		public getOrigin: Point2dGetter,
		public getDestination: Point2dGetter,
		public getDisplacement: Vector2dGetter,
	) {}

	translate(translation: Coordinates2d | Coordinates2dGetter) {
		const translationGetter =
			typeof translation === "function" ? translation : () => translation

		const clonedGetOrigin = this.getOrigin.bind({})
		this.getOrigin = () =>
			clonedGetOrigin().add(
				Point2d.fromCoordinates2d(translationGetter()),
			)

		const clonedGetDestination = this.getDestination.bind({})
		this.getOrigin = () =>
			clonedGetDestination().add(
				Point2d.fromCoordinates2d(translationGetter()),
			)

		const clonedGetDisplacement = this.getDisplacement.bind({})
		this.getDisplacement = () => {
			const { x, y } = translationGetter()
			return clonedGetDisplacement().translate(x, y)
		}

		return this
	}

	toSegment(isStart = false) {
		const { tail, head } = this.getDisplacement()
		return isStart
			? `M${tail.x} ${tail.y} L${head.x} ${head.y}`
			: `L${head.x} ${head.y}`
	}

	clone() {
		return new StraightMovement(
			this.getOrigin.bind({}),
			this.getDestination.bind({}),
			this.getDisplacement.bind({}),
		)
	}

	createParallel(
		gap: number,
		{ previous, next }: { previous?: Movement; next?: Movement },
	) {
		const clonedGetDisplacement = this.getDisplacement.bind({})

		const getTail = () => {
			const parallelDisplacement =
				clonedGetDisplacement().perpendicularTranslate(gap)
			if (!previous) return parallelDisplacement.tail

			const previousIntersection = previous
				.getDisplacement()
				.perpendicularTranslate(gap)
				.toLine2d()
				.intersects(parallelDisplacement.toLine2d())

			if (previousIntersection) return previousIntersection
			// no intersection, previous displacement is parallel
			return parallelDisplacement.tail
		}

		const getHead = () => {
			const parallelDisplacement =
				clonedGetDisplacement().perpendicularTranslate(gap)
			if (!next) return parallelDisplacement.head

			const nextIntersection = parallelDisplacement
				.toLine2d()
				.intersects(
					next
						.getDisplacement()
						.perpendicularTranslate(gap)
						.toLine2d(),
				)

			if (nextIntersection) return nextIntersection
			// no intersection, next displacement is parallel
			return parallelDisplacement.head
		}

		return new StraightMovement(
			getTail,
			getHead,
			() => new Vector2d(getHead(), getTail()),
		)
	}

	// toGapped(
	// 	gap: number,
	// 	previousVector?: Vector2dGetter,
	// 	nextVector?: Vector2dGetter,
	// ): StraightMovement {
	// 	const getParallelVector = () => {
	// 		const parallel = this.getDisplacement().perpendicularTranslate(gap)
	// 		if (!previousVector) return parallel

	// 		const intersection = previousVector()
	// 			.clone()
	// 			.perpendicularTranslate(gap)
	// 			.toLine2d()
	// 			.intersects(parallel.toLine2d())

	// 		if (intersection) {
	// 			parallel.tail = intersection
	// 		}

	// 		return parallel
	// 	}

	// 	if (!nextVector) {
	// 		return new StraightVectorProperties(getParallelVector)
	// 	}

	// 	// intersection between the gap spaced parallels of this and next vector
	// 	const getParallelIntersection = () => {
	// 		return getParallelVector()
	// 			.toLine2d()
	// 			.intersects(
	// 				nextVector().clone().perpendicularTranslate(gap).toLine2d(),
	// 			)
	// 	}

	// 	return new StraightVectorProperties(() => {
	// 		const parallel = getParallelVector()
	// 		const intersection = getParallelIntersection()

	// 		if (intersection) {
	// 			parallel.head = intersection
	// 			return parallel
	// 		}

	// 		return parallel // no intersection, this and nextVector are parallel
	// 	})
	// }
}

export default StraightMovement
