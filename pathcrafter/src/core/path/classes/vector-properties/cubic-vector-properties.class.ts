import type { Coordinates2d } from "@lib/geometry/2d/types"
import StraightVectorProperties from "@src/core/path/classes/vector-properties/straight-vector-properties.class"
import type { Coordinates2dGetter, Vector2dGetter } from "@src/core/path/types"

class CubicVectorProperties extends StraightVectorProperties {
	constructor(
		getDisplacement: Vector2dGetter,
		public getStartControl: Vector2dGetter,
		public getEndControl: Vector2dGetter,
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

		this.getStartControl = () => {
			const { x, y } = translationGetter()
			return this.getStartControl.bind({})().translate(x, y)
		}

		this.getEndControl = () => {
			const { x, y } = translationGetter()
			return this.getEndControl.bind({})().translate(x, y)
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
		return new CubicVectorProperties(
			this.getDisplacement.bind({}),
			this.getStartControl.bind({}),
			this.getEndControl.bind({}),
		)
	}
}

export default CubicVectorProperties
