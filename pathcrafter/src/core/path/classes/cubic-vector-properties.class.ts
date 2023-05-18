import StraightVectorProperties from "@src/core/path/classes/straight-vector-properties.class"
import type { Vector2dGetter } from "@src/core/path/types"

class CubicVectorProperties extends StraightVectorProperties {
	constructor(
		getDisplacement: Vector2dGetter,
		public getStartControl: Vector2dGetter,
		public getEndControl: Vector2dGetter,
	) {
		super(getDisplacement)
	}

	override translate(x: number, y: number) {
		const displacementClone = this.getDisplacement.bind({})
		this.getDisplacement = () => {
			return displacementClone().translate(x, y)
		}

		const startClone = this.getStartControl.bind({})
		this.getStartControl = () => {
			return startClone().translate(x, y)
		}

		const endClone = this.getEndControl.bind({})
		this.getEndControl = () => {
			return endClone().translate(x, y)
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
			this.getDisplacement,
			this.getStartControl,
			this.getEndControl,
		)
	}
}

export default CubicVectorProperties
