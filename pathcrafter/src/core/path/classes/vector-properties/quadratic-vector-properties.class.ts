import type { Coordinates2d } from "@lib/geometry/2d/types"
import StraightVectorProperties from "@src/core/path/classes/vector-properties/straight-vector-properties.class"
import type { Coordinates2dGetter, Vector2dGetter } from "@src/core/path/types"

class QuadraticVectorProperties extends StraightVectorProperties {
	constructor(
		getDisplacement: Vector2dGetter,
		public getControl: Vector2dGetter,
	) {
		super(getDisplacement)
	}

	override translate(translation: Coordinates2d | Coordinates2dGetter) {
		const translationGetter =
			typeof translation === "function" ? translation : () => translation

		this.getDisplacement = () => {
			const { x, y } = translationGetter()
			return this.getDisplacement.bind({})().translate(x, y)
		}

		this.getControl = () => {
			const { x, y } = translationGetter()
			return this.getControl.bind({})().translate(x, y)
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
		return new QuadraticVectorProperties(
			this.getDisplacement,
			this.getControl,
		)
	}
}

export default QuadraticVectorProperties
