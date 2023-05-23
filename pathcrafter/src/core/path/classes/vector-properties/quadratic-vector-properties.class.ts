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

	override toGapped(
		gap: number,
		nextVector?: Vector2dGetter,
		previousVector?: Vector2dGetter,
	): QuadraticVectorProperties {
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

		const getParallelControl = () => {
			const { tail: translation } = getParallelVector().substract(
				this.getDisplacement(),
			)
			return this.getControl().translate(translation.x, translation.y)
		}

		if (!nextVector) {
			return new QuadraticVectorProperties(
				getParallelVector,
				getParallelControl,
			)
		}

		// intersection between the gap spaced parallels of this and next vector
		const getParallelIntersection = () =>
			getParallelVector()
				.toLine2d()
				.intersects(
					nextVector().clone().perpendicularTranslate(gap).toLine2d(),
				)

		return new QuadraticVectorProperties(() => {
			const parallel = getParallelVector()
			const intersection = getParallelIntersection()

			if (intersection) {
				parallel.head = intersection
				return parallel
			}

			return parallel // no intersection, this and nextVector are parallel
		}, getParallelControl)
	}

	override clone() {
		return new QuadraticVectorProperties(
			this.getDisplacement.bind({}),
			this.getControl.bind({}),
		)
	}
}

export default QuadraticVectorProperties
