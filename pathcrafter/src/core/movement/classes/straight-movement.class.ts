import Point2d from "@lib/geometry/2d/classes/point2d.class"
import Vector2d from "@lib/geometry/2d/classes/vector2d.class"
import type { Coordinates2d } from "@lib/geometry/2d/types"
import type { Movement, SegmentDestination } from "@src/core/movement/types"
import type {
	Coordinates2dGetter,
	Point2dGetter,
	Vector2dGetter,
} from "@src/core/path/types"

class StraightMovement {
	constructor(
		public getOrigin: Point2dGetter,
		public getDestination: Point2dGetter,
		public getDisplacement: Vector2dGetter,
		public marker?: string,
	) {}

	translate(translation: Coordinates2d | Coordinates2dGetter) {
		const translationGetter =
			typeof translation === "function" ? translation : () => translation

		const clonedGetOrigin = this.getOrigin.bind({})
		this.getOrigin = (lastPosition: Point2d) =>
			clonedGetOrigin(lastPosition).add(
				Point2d.fromCoordinates2d(translationGetter(lastPosition)),
			)

		const clonedGetDestination = this.getDestination.bind({})
		this.getDestination = (lastPosition: Point2d) =>
			clonedGetDestination(lastPosition).add(
				Point2d.fromCoordinates2d(translationGetter(lastPosition)),
			)

		const clonedGetDisplacement = this.getDisplacement.bind({})
		this.getDisplacement = (lastPosition: Point2d) => {
			const { x, y } = translationGetter(lastPosition)
			return clonedGetDisplacement(lastPosition).translate(x, y)
		}

		return this
	}

	toSegment({ displacement }: SegmentDestination, startingPoint?: Point2d) {
		return startingPoint
			? `M${startingPoint.x} ${startingPoint.y} L${displacement.x} ${displacement.y}`
			: `L${displacement.x} ${displacement.y}`
	}

	clone() {
		return new StraightMovement(
			this.getOrigin.bind({}),
			this.getDestination.bind({}),
			this.getDisplacement.bind({}),
			this.marker,
		)
	}

	createParallel(
		gap: number,
		{ previous, next }: { previous?: Movement; next?: Movement },
	) {
		const clonedGetDisplacement = this.getDisplacement.bind({})

		const getOrigin = (lastPosition: Point2d) => {
			const parallelDisplacement =
				clonedGetDisplacement(lastPosition).perpendicularTranslate(gap)
			if (!previous) return parallelDisplacement.tail

			const previousIntersection = previous
				.getDisplacement(lastPosition)
				.perpendicularTranslate(gap)
				.toLine2d()
				.getIntersection(parallelDisplacement.toLine2d())

			if (previousIntersection) return previousIntersection
			// no intersection, previous displacement is parallel
			return parallelDisplacement.tail
		}

		const getDestination = (lastPosition: Point2d) => {
			const parallelDisplacement =
				clonedGetDisplacement(lastPosition).perpendicularTranslate(gap)
			if (!next) return parallelDisplacement.head

			const nextIntersection = parallelDisplacement
				.toLine2d()
				.getIntersection(
					next
						.getDisplacement(lastPosition)
						.perpendicularTranslate(gap)
						.toLine2d(),
				)

			if (nextIntersection) return nextIntersection
			// no intersection, next displacement is parallel
			return parallelDisplacement.head
		}

		return new StraightMovement(
			getOrigin,
			getDestination,
			(lastPosition: Point2d) =>
				new Vector2d(
					getDestination(lastPosition),
					getOrigin(lastPosition),
				),
			this.marker,
		)
	}
}

export default StraightMovement
