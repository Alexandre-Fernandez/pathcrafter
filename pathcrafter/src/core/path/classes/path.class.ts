import Point2d from "@lib/geometry/2d/point2d.class"
import Vector2d from "@lib/geometry/2d/vector2d.class"
import PathInternals from "@src/core/path/classes/path-internals.class"
import NoStartingPoint from "@src/core/path/errors/no-starting-point.error"
import EmptyVectors from "@src/core/path/errors/empty-vectors.error"
import StraightVectorProperties from "@src/core/path/classes/straight-vector-properties.class"
import CubicVectorProperties from "@src/core/path/classes/cubic-vector-properties.class"
import QuadraticVectorProperties from "@src/core/path/classes/quadratic-vector-properties.class"
import type { Coordinates2d } from "@lib/geometry/2d/types"
import type { Coordinates2dGetter, LengthGetter } from "@src/core/path/types"
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

	toElement() {
		if (!this.internals.start) throw new NoStartingPoint()

		const startingPoint = this.internals.start()
		const [first, ...rest] = this.internals.vectorProperties

		if (!first) throw new EmptyVectors()

		const firstTranslated = first
			.clone()
			.translate(startingPoint.x, startingPoint.y)

		let d = firstTranslated.toSegment(true)

		let lastHead = firstTranslated.getDisplacement().head
		for (const vectorProperties of rest) {
			const nextTranslated = vectorProperties
				.clone()
				.translate(lastHead.x, lastHead.y)
			lastHead = nextTranslated.getDisplacement().head
			d += ` ${nextTranslated.toSegment()}`
		}

		const path = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"path",
		)
		path.setAttribute("d", d)
		path.setAttribute("fill", "none")
		path.setAttribute("stroke", "black")
		path.setAttribute("stroke-width", "2")
		return path
	}

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
		this.internals.vectorProperties.push(
			new StraightVectorProperties(() =>
				Vector2d.fromCoordinates(getLength(), 0),
			),
		)

		return this
	}

	vertical(length: number | LengthGetter) {
		const getLength = this.#getterize(length)
		this.internals.vectorProperties.push(
			new StraightVectorProperties(() =>
				Vector2d.fromCoordinates(0, getLength()),
			),
		)
		return this
	}

	diagonal(length: Coordinates2d | Coordinates2dGetter) {
		const getLength = this.#getterize(length)
		this.internals.vectorProperties.push(
			new StraightVectorProperties(() => {
				const { x, y } = getLength()
				return Vector2d.fromCoordinates(x, y)
			}),
		)
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
		this.internals.vectorProperties.push(
			new CubicVectorProperties(
				() => {
					const { x, y } = getLength()
					return Vector2d.fromCoordinates(x, y)
				},
				() => {
					const { x, y } = getStartControl()
					return Vector2d.fromCoordinates(x, y)
				},
				() => {
					const length = getLength()
					const endControl = getEndControl()
					return new Vector2d(
						new Point2d(
							length.x + endControl.x,
							length.y + endControl.y,
						),
						length,
					)
				},
			),
		)
		return this
	}

	quadratic(
		length: Coordinates2d | Coordinates2dGetter,
		control: Coordinates2d | Coordinates2dGetter,
	) {
		const getLength = this.#getterize(length)
		const getControl = this.#getterize(control)
		this.internals.vectorProperties.push(
			new QuadraticVectorProperties(
				() => {
					const { x, y } = getLength()
					return Vector2d.fromCoordinates(x, y)
				},
				() => {
					const { x, y } = getControl()
					return Vector2d.fromCoordinates(x, y)
				},
			),
		)
		return this
	}

	clone() {
		const path = new Path()
		path.internals = this.internals.clone()
		return path
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
