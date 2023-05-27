import Point2d from "@lib/geometry/2d/point2d.class"
import StraightMovement from "@src/core/movement/classes/straight-movement.class"
import type { Coordinates2d } from "@lib/geometry/2d/types"
import type {
	Coordinates2dGetter,
	Point2dGetter,
	Vector2dGetter,
} from "@src/types"

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
}

export default CubicMovement
