import type Point2d from "@lib/geometry/2d/point2d.class"
import Vector2d from "@lib/geometry/2d/vector2d.class"
import PathStarted from "@src/core/path/errors/path-started.error"
import { assertIsCardinalDirection } from "@src/core/path/guards"
import type {
	LengthGetter,
	Point2dGetter,
	Vector2dGetter,
} from "@src/core/path/types"

class Path {
	#vectors: Vector2dGetter[] = []

	#start: Point2dGetter | null = null

	get #end() {
		return this.#vectors.at(-1)?.().head || null
	}

	start(startingPoint: Point2d | Point2dGetter) {
		if (!this.#start) throw new PathStarted()
		this.#start =
			typeof startingPoint === "function"
				? startingPoint
				: () => startingPoint
	}

	top(length: number | LengthGetter) {
		this.#pushVector(this.#toLengthGetter(length), Vector2d.TOP)
	}

	right(length: number | LengthGetter) {
		this.#pushVector(this.#toLengthGetter(length), Vector2d.RIGHT)
	}

	bottom(length: number | LengthGetter) {
		this.#pushVector(this.#toLengthGetter(length), Vector2d.BOTTOM)
	}

	left(length: number | LengthGetter) {
		this.#pushVector(this.#toLengthGetter(length), Vector2d.LEFT)
	}

	#pushVector(getLength: LengthGetter, direction: Vector2d) {
		assertIsCardinalDirection(direction)
		const clonedDirection = direction.clone()
		this.#vectors.push(() => clonedDirection.scalarMultiply(getLength()))
	}

	#toLengthGetter(length: number | LengthGetter) {
		return typeof length === "number" ? () => length : length
	}
}

export default Path
