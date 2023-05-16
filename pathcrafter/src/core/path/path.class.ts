import type Point2d from "@lib/geometry/2d/point2d.class"
import Vector2d from "@lib/geometry/2d/vector2d.class"
import EmptyMovements from "@src/core/path/errors/empty-movements.error"
import NoStartingPoint from "@src/core/path/errors/no-starting-point.error"
import { assertIsCardinalDirection } from "@src/core/path/guards"
import type {
	LengthGetter,
	Point2dGetter,
	Vector2dGetter,
} from "@src/core/path/types"

class Path {
	#movements: Vector2dGetter[] = [] // position vectors

	#start: Point2dGetter | null = null

	#style = {}

	get #end() {
		return this.#movements.at(-1)?.().head || null
	}

	get size() {
		if (!this.#start) throw new NoStartingPoint()
		return ""
	}

	get() {
		if (!this.#start) throw new NoStartingPoint()

		const { x: startX, y: startY } = this.#start()
		const [firstGetter, ...rest] = this.#movements

		if (!firstGetter) throw new EmptyMovements()

		const first = firstGetter().translate(startX, startY)
		const path = [first]

		let lastHead = first.head
		for (const getter of rest) {
			const nextSegment = getter().translate(lastHead.x, lastHead.y)
			path.push(nextSegment)
			lastHead = nextSegment.head
		}

		return path
	}

	start(startingPoint: Point2d | Point2dGetter) {
		this.#start =
			typeof startingPoint === "function"
				? startingPoint
				: () => startingPoint
	}

	top(length: number | LengthGetter) {
		this.#addMovement(this.#toLengthGetter(length), Vector2d.TOP)
		return this
	}

	right(length: number | LengthGetter) {
		this.#addMovement(this.#toLengthGetter(length), Vector2d.RIGHT)
		return this
	}

	bottom(length: number | LengthGetter) {
		this.#addMovement(this.#toLengthGetter(length), Vector2d.BOTTOM)
		return this
	}

	left(length: number | LengthGetter) {
		this.#addMovement(this.#toLengthGetter(length), Vector2d.LEFT)
		return this
	}

	#addMovement(getLength: LengthGetter, direction: Vector2d) {
		assertIsCardinalDirection(direction)
		const clonedDirection = direction.clone()
		this.#movements.push(() => clonedDirection.scalarMultiply(getLength()))
	}

	#toLengthGetter(length: number | LengthGetter) {
		return typeof length === "number" ? () => length : length
	}
}

export default Path
