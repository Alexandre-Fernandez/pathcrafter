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

	override toGapped(
		gap: number,
		nextVector?: Vector2dGetter,
		previousVector?: Vector2dGetter,
	): CubicVectorProperties {
		const getParallelVector = () => {
			const parallel = this.getDisplacement().perpendicularTranslate(gap)
			if (!previousVector) return parallel

			const intersection = previousVector()
				.clone()
				.perpendicularTranslate(gap)
				.toLine2d()
				.intersects(parallel.toLine2d())

			if (intersection) {
				parallel.tail = intersection
			}

			return parallel
		}

		const getParallelStartControl = () => {
			const { tail: translation } = getParallelVector().substract(
				this.getDisplacement(),
			)
			return this.getStartControl().translate(
				translation.x,
				translation.y,
			)
		}

		const getParallelEndControl = () => {
			const { head: translation } = getParallelVector().substract(
				this.getDisplacement(),
			)
			return this.getEndControl().translate(translation.x, translation.y)
		}

		if (!nextVector) {
			return new CubicVectorProperties(
				getParallelVector,
				getParallelStartControl,
				getParallelEndControl,
			)
		}

		// intersection between the gap spaced parallels of this and next vector
		const getParallelIntersection = () =>
			getParallelVector()
				.toLine2d()
				.intersects(
					nextVector().clone().perpendicularTranslate(gap).toLine2d(),
				)

		return new CubicVectorProperties(
			() => {
				const parallel = getParallelVector()
				const intersection = getParallelIntersection()

				if (intersection) {
					parallel.head = intersection
					return parallel
				}

				return parallel // no intersection, this and nextVector are parallel
			},
			getParallelStartControl,
			getParallelEndControl,
		)
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
