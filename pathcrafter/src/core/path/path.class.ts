import Point2d from "@lib/geometry/2d/point2d.class"
import Vector2d from "@lib/geometry/2d/vector2d.class"
import PathInternals from "@src/core/path/path-internals.class"
import type { Coordinates2d } from "@lib/geometry/2d/types"
import type { Coordinates2dGetter, LengthGetter } from "@src/core/path/types"
import SegmentType from "@src/core/path/enums/segment-type.enum"

/*

movements = [
	{
		direction: Vector2.TOP
		getMovement: () => {}
	}
]

*/

class Path {
	internals = new PathInternals()

	// #style = {}

	// get #end() {
	// 	return this.#movements.at(-1)?.().head || null
	// }

	// get size() {
	// 	if (!this.#start) throw new NoStartingPoint()
	// 	return ""
	// }

	// getParallel(xTranslate: number, yTranslate: number) {
	// 	const parallel = this.clone()
	// }

	// get() {
	// 	if (!this.#start) throw new NoStartingPoint()

	// 	const { x: startX, y: startY } = this.#start()
	// 	const [firstGetter, ...rest] = this.#movements

	// 	if (!firstGetter) throw new EmptyMovements()

	// 	const first = firstGetter().translate(startX, startY)
	// 	const path = [first]

	// 	let lastHead = first.head
	// 	for (const getter of rest) {
	// 		const nextSegment = getter().translate(lastHead.x, lastHead.y)
	// 		path.push(nextSegment)
	// 		lastHead = nextSegment.head
	// 	}

	// 	return path
	// }

	start(startingPoint: Coordinates2d | Coordinates2dGetter | null) {
		if (startingPoint) {
			this.internals.start =
				typeof startingPoint === "function"
					? () => {
							const { x, y } = startingPoint()
							return new Point2d(x, y)
					  }
					: () => new Point2d(startingPoint.x, startingPoint.y)
		} else {
			this.internals.start = null
		}
		return this
	}

	horizontal(length: number | LengthGetter) {
		const getLength = this.#getterize(length)
		this.internals.vectors.push({
			type: SegmentType.Straight,
			getDisplacement: () => Vector2d.fromCoordinates(getLength(), 0),
		})
		return this
	}

	vertical(length: number | LengthGetter) {
		const getLength = this.#getterize(length)
		this.internals.vectors.push({
			type: SegmentType.Straight,
			getDisplacement: () => Vector2d.fromCoordinates(0, getLength()),
		})
		return this
	}

	diagonal(length: Coordinates2d | Coordinates2dGetter) {
		const getLength = this.#getterize(length)
		this.internals.vectors.push({
			type: SegmentType.Straight,
			getDisplacement: () => {
				const { x, y } = getLength()
				return Vector2d.fromCoordinates(x, y)
			},
		})
		return this
	}

	cubic(
		length: Coordinates2d | Coordinates2dGetter,
		startControl: Coordinates2d | Coordinates2dGetter,
		endControl: Coordinates2d | Coordinates2dGetter,
	) {
		const getLength = this.#getterize(length)
		const getStartControl = this.#getterize(startControl)
		const getEndControl = this.#getterize(endControl)
		this.internals.vectors.push({
			type: SegmentType.Cubic,
			getDisplacement: () => {
				const { x, y } = getLength()
				return Vector2d.fromCoordinates(x, y)
			},
			getStartControl: () => {
				const { x, y } = getStartControl()
				return Vector2d.fromCoordinates(x, y)
			},
			getEndControl: () => {
				const { x, y } = getEndControl()
				return Vector2d.fromCoordinates(x, y)
			},
		})
		return this
	}

	quadratic(
		length: Coordinates2d | Coordinates2dGetter,
		control: Coordinates2d | Coordinates2dGetter,
	) {
		const getLength = this.#getterize(length)
		const getControl = this.#getterize(control)
		this.internals.vectors.push({
			type: SegmentType.Quadratic,
			getDisplacement: () => {
				const { x, y } = getLength()
				return Vector2d.fromCoordinates(x, y)
			},
			getControl: () => {
				const { x, y } = getControl()
				return Vector2d.fromCoordinates(x, y)
			},
		})
		return this
	}

	#getterize<T, U extends () => T>(value: Exclude<T, Function> | U): () => T {
		return typeof value === "function" ? (value as U) : () => value
	}

	// top(length: number | LengthGetter) {
	// 	this.#addMovement(this.#toLengthGetter(length), Vector2d.TOP)
	// 	return this
	// }

	// right(length: number | LengthGetter) {
	// 	this.#addMovement(this.#toLengthGetter(length), Vector2d.RIGHT)
	// 	return this
	// }

	// bottom(length: number | LengthGetter) {
	// 	this.#addMovement(this.#toLengthGetter(length), Vector2d.BOTTOM)
	// 	return this
	// }

	// left(length: number | LengthGetter) {
	// 	this.#addMovement(this.#toLengthGetter(length), Vector2d.LEFT)
	// 	return this
	// }

	clone() {
		const path = new Path()
		path.internals = this.internals.clone()
		return path
	}

	// toString() {
	// 	return this.get()
	// 		.map((vector) => vector.toString())
	// 		.join("\n")
	// }

	// #addMovement(getLength: LengthGetter, direction: Vector2d) {
	// 	assertIsCardinalDirection(direction)
	// 	const clonedDirection = direction.clone()
	// 	this.#movements.push({
	// 		direction,
	// 		get: () => clonedDirection.scalarMultiply(getLength()),
	// 	})
	// }
}

export default Path
