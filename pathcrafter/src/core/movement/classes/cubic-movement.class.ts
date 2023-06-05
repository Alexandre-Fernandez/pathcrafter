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

class CubicMovement extends StraightMovement {
	constructor(
		getOrigin: Point2dGetter,
		getDestination: Point2dGetter,
		getDisplacement: Vector2dGetter,
		public getStartControl: Vector2dGetter,
		public getEndControl: Vector2dGetter,
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

		const clonedGetStartControl = this.getStartControl.bind({})
		this.getStartControl = (lastPosition: Point2d) => {
			const { x, y } = translationGetter(lastPosition)
			return clonedGetStartControl(lastPosition).translate(x, y)
		}

		const clonedGetEndControl = this.getEndControl.bind({})
		this.getEndControl = (lastPosition: Point2d) => {
			const { x, y } = translationGetter(lastPosition)
			return clonedGetEndControl(lastPosition).translate(x, y)
		}

		return this
	}

	override toSegment(
		{ displacement, startControl, endControl }: SegmentDestination,
		startingPoint?: Point2d,
	) {
		if (!startControl) throw new NullDestination("startControl")
		if (!endControl) throw new NullDestination("endControl")
		return startingPoint
			? `M${startingPoint.x} ${startingPoint.y} C${startControl.x} ${startControl.y},${endControl.x} ${endControl.y},${displacement.x} ${displacement.y}`
			: `C${startControl.x} ${startControl.y},${endControl.x} ${endControl.y},${displacement.x} ${displacement.y}`
	}

	override clone() {
		return new CubicMovement(
			this.getOrigin.bind({}),
			this.getDestination.bind({}),
			this.getDisplacement.bind({}),
			this.getStartControl.bind({}),
			this.getEndControl.bind({}),
			this.marker,
		)
	}
}

export default CubicMovement
