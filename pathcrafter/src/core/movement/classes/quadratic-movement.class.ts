import Point2d from "@lib/geometry/2d/point2d.class"
import StraightMovement from "@src/core/movement/classes/straight-movement.class"
import type { Coordinates2d } from "@lib/geometry/2d/types"
import type {
	Coordinates2dGetter,
	Point2dGetter,
	Vector2dGetter,
} from "@src/types"

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
			this.marker,
		)
	}
}

export default QuadraticMovement
