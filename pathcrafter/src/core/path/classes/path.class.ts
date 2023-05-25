import { generateUniqueId } from "@lib/dom"
import Point2d from "@lib/geometry/2d/point2d.class"
import Vector2d from "@lib/geometry/2d/vector2d.class"
import PathInternals from "@src/core/path/classes/path-internals.class"
import CubicVectorProperties from "@src/core/path/classes/vector-properties/cubic-vector-properties.class"
import QuadraticVectorProperties from "@src/core/path/classes/vector-properties/quadratic-vector-properties.class"
import { SVG_NAMESPACE } from "@src/constants"
import type { Coordinates2d } from "@lib/geometry/2d/types"
import type {
	Coordinates2dGetter,
	LengthGetter,
	Movement,
} from "@src/core/path/types"
import StraightMovement from "@src/core/path/classes/movements/straight-movement.class"

// movements
// vectors
// segments

class Path {
	internals = new PathInternals()

	#id

	#lastDestination: Movement["getDestination"]

	#movements: Movement[] = []

	#groupEl

	#pathEl

	constructor(
		startingPoint: Coordinates2d | Coordinates2dGetter,
		id = generateUniqueId(),
	) {
		// props
		const getStartingPoint = this.#getterize(startingPoint)
		this.#lastDestination = () => {
			const { x, y } = getStartingPoint()
			return new Point2d(x, y)
		}
		this.#id = id

		// dom
		this.#pathEl = document.createElementNS(SVG_NAMESPACE, "path")
		this.#groupEl = document.createElementNS(SVG_NAMESPACE, "g")
		this.#groupEl.id = this.id
		this.#groupEl.append(this.#pathEl)
	}

	get id() {
		return this.#id
	}

	addHorizontal(length: number | LengthGetter) {
		const getLength = this.#getterize(length)
		const getTail = this.#lastDestination.bind({})
		const getHead = () => getTail().clone().add(new Point2d(getLength(), 0))

		this.#movements.push(
			new StraightMovement(
				getTail,
				getHead,
				() => new Vector2d(getHead(), getTail()),
			),
		)

		this.#lastDestination = getHead

		return this
	}

	addVertical(length: number | LengthGetter) {
		const getLength = this.#getterize(length)
		const getTail = this.#lastDestination.bind({})
		const getHead = () => getTail().clone().add(new Point2d(0, getLength()))

		this.#movements.push(
			new StraightMovement(
				getTail,
				getHead,
				() => new Vector2d(getHead(), getTail()),
			),
		)

		this.#lastDestination = getHead

		return this
	}

	addDiagonal(length: Coordinates2d | Coordinates2dGetter) {
		const getLength = this.#getterize(length)
		const getTail = this.#lastDestination.bind({})
		const getHead = () => {
			const { x, y } = getLength()
			return getTail().clone().add(new Point2d(x, y))
		}

		this.#movements.push(
			new StraightMovement(
				getTail,
				getHead,
				() => new Vector2d(getHead(), getTail()),
			),
		)

		this.#lastDestination = getHead

		return this
	}

	addCubic(
		length: Coordinates2d | Coordinates2dGetter,
		startControl: Coordinates2d | Coordinates2dGetter,
		endControl: Coordinates2d | Coordinates2dGetter,
	) {
		const getLength = this.#getterize(length)
		const getStartControl = this.#getterize(startControl)
		const getEndControl = this.#getterize(endControl)

		this.internals.vectors.push(
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

	addQuadratic(
		length: Coordinates2d | Coordinates2dGetter,
		control: Coordinates2d | Coordinates2dGetter,
	) {
		const getLength = this.#getterize(length)
		const getControl = this.#getterize(control)
		this.internals.vectors.push(
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

	getElement() {
		return this.#groupEl
	}

	updateElement() {
		let d = ""

		for (const [i, movement] of this.#movements.entries()) {
			d +=
				i === 0 //
					? movement.toSegment(true)
					: ` ${movement.toSegment()}`
		}

		this.#pathEl.setAttribute("d", d)

		return this
	}

	// updateElement() {
	// 	let d = ""

	// 	this.internals.forEachTranslatedVector((vector, i) => {
	// 		if (i === 0) {
	// 			d += vector.toSegment(true)
	// 			return
	// 		}
	// 		d += ` ${vector.toSegment()}`
	// 	})

	// 	this.#pathEl.setAttribute("d", d)

	// 	return this
	// }

	// getParallel(gap: number) {
	// 	const parallel: VectorProperties[] = []

	// 	const translatedVectors = this.internals.getTranslatedVectors()

	// 	for (const [i, vector] of translatedVectors.entries()) {
	// 		const lastIndex = translatedVectors.length - 1

	// 		const nextVector = translatedVectors[Math.min(i + 1, lastIndex)]
	// 		const previousVector = translatedVectors[Math.max(0, i - 1)]

	// 		if (i === 0) {
	// 			parallel.push(
	// 				vector.toGapped(
	// 					gap,
	// 					undefined,
	// 					nextVector?.getDisplacement,
	// 				),
	// 			)
	// 			continue
	// 		}

	// 		if (i === lastIndex) {
	// 			parallel.push(
	// 				vector.toGapped(gap, previousVector?.getDisplacement),
	// 			)
	// 			continue
	// 		}

	// 		parallel.push(
	// 			vector.toGapped(
	// 				gap,
	// 				previousVector?.getDisplacement,
	// 				nextVector?.getDisplacement,
	// 			),
	// 		)
	// 	}

	// 	const path = new Path()
	// 	path.internals.vectors = parallel
	// 	path.internals.start = () => parallel[0]!.getDisplacement().tail

	// 	return path
	// }

	clone() {
		const path = new Path(this.#lastDestination.bind({}))
		path.internals = this.internals.clone()
		return path
	}

	#getterize<T, U extends () => T>(value: Exclude<T, Function> | U): () => T {
		return typeof value === "function" ? (value as U) : () => value
	}
}

export default Path
