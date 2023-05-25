import StraightMovement from "@src/core/path/classes/movements/straight-movement.class"
import type { Coordinates2d } from "@lib/geometry/2d/types"
import type {
	Coordinates2dGetter,
	Point2dGetter,
	Vector2dGetter,
} from "@src/core/path/types"
import Point2d from "@lib/geometry/2d/point2d.class"

class CubicMovement extends StraightMovement {
	constructor(
		getOrigin: Point2dGetter,
		getDestination: Point2dGetter,
		getDisplacement: Vector2dGetter,
		public getStartControl: Vector2dGetter,
		public getEndControl: Vector2dGetter,
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

		const clonedGetStartControl = this.getStartControl.bind({})
		this.getStartControl = () => {
			const { x, y } = translationGetter()
			return clonedGetStartControl().translate(x, y)
		}

		const clonedGetEndControl = this.getEndControl.bind({})
		this.getEndControl = () => {
			const { x, y } = translationGetter()
			return clonedGetEndControl().translate(x, y)
		}

		return this
	}

	override toSegment(isStart = false) {
		const { tail, head } = this.getDisplacement()
		const { head: startControl } = this.getStartControl()
		const { head: endControl } = this.getEndControl()
		return isStart
			? `M${tail.x} ${tail.y} C${startControl.x} ${startControl.y},${endControl.x} ${endControl.y},${head.x} ${head.y}`
			: `C${startControl.x} ${startControl.y},${endControl.x} ${endControl.y},${head.x} ${head.y}`
	}

	override clone() {
		return new CubicMovement(
			this.getOrigin.bind({}),
			this.getDestination.bind({}),
			this.getDisplacement.bind({}),
			this.getStartControl.bind({}),
			this.getEndControl.bind({}),
		)
	}

	// override toGapped(
	// 	gap: number,
	// 	nextVector?: Vector2dGetter,
	// 	previousVector?: Vector2dGetter,
	// ): CubicVectorProperties {
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

	// 	const getParallelStartControl = () => {
	// 		const { tail: translation } = getParallelVector().substract(
	// 			this.getDisplacement(),
	// 		)
	// 		return this.getStartControl().translate(
	// 			translation.x,
	// 			translation.y,
	// 		)
	// 	}

	// 	const getParallelEndControl = () => {
	// 		const { head: translation } = getParallelVector().substract(
	// 			this.getDisplacement(),
	// 		)
	// 		return this.getEndControl().translate(translation.x, translation.y)
	// 	}

	// 	if (!nextVector) {
	// 		return new CubicVectorProperties(
	// 			getParallelVector,
	// 			getParallelStartControl,
	// 			getParallelEndControl,
	// 		)
	// 	}

	// 	// intersection between the gap spaced parallels of this and next vector
	// 	const getParallelIntersection = () =>
	// 		getParallelVector()
	// 			.toLine2d()
	// 			.intersects(
	// 				nextVector().clone().perpendicularTranslate(gap).toLine2d(),
	// 			)

	// 	return new CubicVectorProperties(
	// 		() => {
	// 			const parallel = getParallelVector()
	// 			const intersection = getParallelIntersection()

	// 			if (intersection) {
	// 				parallel.head = intersection
	// 				return parallel
	// 			}

	// 			return parallel // no intersection, this and nextVector are parallel
	// 		},
	// 		getParallelStartControl,
	// 		getParallelEndControl,
	// 	)
	// }
}

export default CubicMovement
