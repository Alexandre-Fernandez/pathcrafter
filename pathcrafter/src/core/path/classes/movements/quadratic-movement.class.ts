import StraightMovement from "@src/core/path/classes/movements/straight-movement.class"
import type { Coordinates2d } from "@lib/geometry/2d/types"
import type {
	Coordinates2dGetter,
	Point2dGetter,
	Vector2dGetter,
} from "@src/core/path/types"
import Point2d from "@lib/geometry/2d/point2d.class"

class QuadraticMovement extends StraightMovement {
	constructor(
		getOrigin: Point2dGetter,
		getDestination: Point2dGetter,
		getDisplacement: Vector2dGetter,
		public getControl: Vector2dGetter,
	) {
		super(getOrigin, getDestination, getDisplacement)
	}

	override translate(translation: Coordinates2d | Coordinates2dGetter) {
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

		const clonedGetControl = this.getControl.bind({})
		this.getControl = () => {
			const { x, y } = translationGetter()
			return clonedGetControl().translate(x, y)
		}

		return this
	}

	override toSegment(isStart = false) {
		const { tail, head } = this.getDisplacement()
		const { head: control } = this.getControl()

		return isStart
			? `M${tail.x} ${tail.y} Q${control.x} ${control.y},${head.x} ${head.y}`
			: `Q${control.x} ${control.y},${head.x} ${head.y}`
	}

	override clone() {
		return new QuadraticMovement(
			this.getOrigin.bind({}),
			this.getDestination.bind({}),
			this.getDisplacement.bind({}),
			this.getControl.bind({}),
		)
	}

	// override toGapped(
	// 	gap: number,
	// 	nextVector?: Vector2dGetter,
	// 	previousVector?: Vector2dGetter,
	// ): QuadraticVectorProperties {
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

	// 	const getParallelControl = () => {
	// 		const { tail: translation } = getParallelVector().substract(
	// 			this.getDisplacement(),
	// 		)
	// 		return this.getControl().translate(translation.x, translation.y)
	// 	}

	// 	if (!nextVector) {
	// 		return new QuadraticVectorProperties(
	// 			getParallelVector,
	// 			getParallelControl,
	// 		)
	// 	}

	// 	// intersection between the gap spaced parallels of this and next vector
	// 	const getParallelIntersection = () =>
	// 		getParallelVector()
	// 			.toLine2d()
	// 			.intersects(
	// 				nextVector().clone().perpendicularTranslate(gap).toLine2d(),
	// 			)

	// 	return new QuadraticVectorProperties(() => {
	// 		const parallel = getParallelVector()
	// 		const intersection = getParallelIntersection()

	// 		if (intersection) {
	// 			parallel.head = intersection
	// 			return parallel
	// 		}

	// 		return parallel // no intersection, this and nextVector are parallel
	// 	}, getParallelControl)
	// }
}

export default QuadraticMovement
