import Point2d from "@lib/geometry/2d/classes/point2d.class"
import StraightMovement from "@src/core/movement/classes/straight-movement.class"
import NullDestination from "@src/core/movement/errors/null-destination.class"
import type { Coordinates2d } from "@lib/geometry/2d/types"
import type {
	Coordinates2dGetter,
	Point2dGetter,
	Vector2dGetter,
} from "@src/core/path/types"
import type { SegmentDestination } from "@src/core/movement/types"

class QuadraticMovement extends StraightMovement {
	constructor(
		getOrigin: Point2dGetter,
		getDestination: Point2dGetter,
		getDisplacement: Vector2dGetter,
		public getControl: Vector2dGetter,
		marker?: string,
	) {
		super(getOrigin, getDestination, getDisplacement, marker)
	}

	override translate(translation: Coordinates2d | Coordinates2dGetter) {
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

		const clonedGetControl = this.getControl.bind({})
		this.getControl = (lastPosition: Point2d) => {
			const { x, y } = translationGetter(lastPosition)
			return clonedGetControl(lastPosition).translate(x, y)
		}

		return this
	}

	override toSegment(
		{ displacement, control }: SegmentDestination,
		startingPoint?: Point2d,
	) {
		if (!control) throw new NullDestination("control")
		return startingPoint
			? `M${startingPoint.x} ${startingPoint.y} Q${control.x} ${control.y},${displacement.x} ${displacement.y}`
			: `Q${control.x} ${control.y},${displacement.x} ${displacement.y}`
	}

	override clone() {
		return new QuadraticMovement(
			this.getOrigin.bind({}),
			this.getDestination.bind({}),
			this.getDisplacement.bind({}),
			this.getControl.bind({}),
			this.marker,
		)
	}
}

export default QuadraticMovement
