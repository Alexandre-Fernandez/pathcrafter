import StraightVectorProperties from "@src/core/path/classes/straight-vector-properties.class"
import type { Vector2dGetter } from "@src/core/path/types"

class QuadraticVectorProperties extends StraightVectorProperties {
	constructor(
		getDisplacement: Vector2dGetter,
		public getControl: Vector2dGetter,
	) {
		super(getDisplacement)
	}

	override translate(x: number, y: number) {
		const displacementClone = this.getDisplacement.bind({})
		this.getDisplacement = () => {
			return displacementClone().translate(x, y)
		}

		const controlClone = this.getControl.bind({})
		this.getControl = () => {
			return controlClone().translate(x, y)
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
