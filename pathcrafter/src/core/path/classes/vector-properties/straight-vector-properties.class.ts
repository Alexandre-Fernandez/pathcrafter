import type { Coordinates2d } from "@lib/geometry/2d/types"
import type { Coordinates2dGetter, Vector2dGetter } from "@src/core/path/types"

class StraightVectorProperties {
	constructor(public getDisplacement: Vector2dGetter) {}

	translate(translation: Coordinates2d | Coordinates2dGetter) {
		const translationGetter =
			typeof translation === "function" ? translation : () => translation

		this.getDisplacement = () => {
			const { x, y } = translationGetter()
			return this.getDisplacement.bind({})().translate(x, y)
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
		return new StraightVectorProperties(this.getDisplacement)
	}
}

export default StraightVectorProperties
