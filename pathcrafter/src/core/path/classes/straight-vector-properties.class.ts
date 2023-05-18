import type { Vector2dGetter } from "@src/core/path/types"

class StraightVectorProperties {
	constructor(public getDisplacement: Vector2dGetter) {}

	translate(x: number, y: number) {
		const displacementClone = this.getDisplacement.bind({})
		this.getDisplacement = () => {
			return displacementClone().translate(x, y)
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
