import { generateUniqueId } from "@lib/dom"
import { assertGuard } from "@lib/ts/guards"
import Point2d from "@lib/geometry/2d/point2d.class"
import Vector2d from "@lib/geometry/2d/vector2d.class"
import { SVG_NAMESPACE } from "@src/constants"
import { isMovementArray } from "@src/core/movement/guards/movement.guard"
import StraightMovement from "@src/core/movement/classes/straight-movement.class"
import CubicMovement from "@src/core/movement/classes/cubic-movement.class"
import QuadraticMovement from "@src/core/movement/classes/quadratic-movement.class"
import type { Coordinates2d } from "@lib/geometry/2d/types"
import type { Coordinates2dGetter, LengthGetter } from "@src/types"
import type { PathInternals } from "@src/core/path/types"
import type { Movement } from "@src/core/movement/types"
import EmptyMovements from "@src/core/path/errors/empty-movements.error"
import UnexpectedError from "@src/errors/unexpected-error.error"

class Path {
	#id

	#lastDestination: Movement["getDestination"]

	#movements: Movement[] = []

	#groupEl

	#pathEl

	constructor(
		startingPoint: Coordinates2d | Coordinates2dGetter,
		id = generateUniqueId(),
		internals: Record<string, unknown> = {},
	) {
		// internals
		if (internals["movements"]) {
			assertGuard(internals["movements"], isMovementArray)
			this.#movements = internals["movements"]
		}

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

		const getDisplacementHead = () =>
			getTail().clone().add(new Point2d(getLength(), 0))

		this.#movements.push(
			new StraightMovement(
				getTail,
				getDisplacementHead,
				() => new Vector2d(getDisplacementHead(), getTail()),
			),
		)

		this.#lastDestination = getDisplacementHead

		return this
	}

	addVertical(length: number | LengthGetter) {
		const getLength = this.#getterize(length)

		const getTail = this.#lastDestination.bind({})

		const getDisplacementHead = () =>
			getTail().clone().add(new Point2d(0, getLength()))

		this.#movements.push(
			new StraightMovement(
				getTail,
				getDisplacementHead,
				() => new Vector2d(getDisplacementHead(), getTail()),
			),
		)

		this.#lastDestination = getDisplacementHead

		return this
	}

	addDiagonal(length: Coordinates2d | Coordinates2dGetter) {
		const getLength = this.#getterize(length)

		const getTail = this.#lastDestination.bind({})

		const getDisplacementHead = () => {
			const { x, y } = getLength()
			return getTail().clone().add(new Point2d(x, y))
		}

		this.#movements.push(
			new StraightMovement(
				getTail,
				getDisplacementHead,
				() => new Vector2d(getDisplacementHead(), getTail()),
			),
		)

		this.#lastDestination = getDisplacementHead

		return this
	}

	addCubic(
		length: Coordinates2d | Coordinates2dGetter,
		startControl: Coordinates2d | Coordinates2dGetter,
		endControl: Coordinates2d | Coordinates2dGetter,
	) {
		const getLength = this.#getterize(length)
		const getStartControl = this.#getterize(startControl) // starts from tail
		const getEndControl = this.#getterize(endControl) // starts from head

		const getTail = this.#lastDestination.bind({})

		const getDisplacementHead = () => {
			const { x, y } = getLength()
			return getTail().clone().add(new Point2d(x, y))
		}
		const getStartControlHead = () => {
			const { x, y } = getStartControl()
			return getTail().clone().add(new Point2d(x, y))
		}
		const getEndControlHead = () => {
			const { x, y } = getEndControl()
			return getDisplacementHead().clone().add(new Point2d(x, y))
		}

		this.#movements.push(
			new CubicMovement(
				getTail,
				getDisplacementHead,
				() => new Vector2d(getDisplacementHead(), getTail()),
				() => new Vector2d(getStartControlHead(), getTail()),
				() => new Vector2d(getEndControlHead(), getDisplacementHead()),
			),
		)

		this.#lastDestination = getDisplacementHead

		return this
	}

	addQuadratic(
		length: Coordinates2d | Coordinates2dGetter,
		control: Coordinates2d | Coordinates2dGetter,
	) {
		const getLength = this.#getterize(length)
		const getControl = this.#getterize(control) // starts from tail

		const getTail = this.#lastDestination.bind({})

		const getDisplacementHead = () => {
			const { x, y } = getLength()
			return getTail().clone().add(new Point2d(x, y))
		}
		const getControlHead = (/* starts from tail */) => {
			const { x, y } = getControl()
			return getTail().clone().add(new Point2d(x, y))
		}

		this.#movements.push(
			new QuadraticMovement(
				getTail,
				getDisplacementHead,
				() => new Vector2d(getDisplacementHead(), getTail()),
				() => new Vector2d(getControlHead(), getTail()),
			),
		)

		this.#lastDestination = getDisplacementHead

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

	createParallel(gap: number, id?: string) {
		if (this.#movements.length === 0) throw new EmptyMovements()

		const movements: Movement[] = []

		for (const [i, movement] of this.#movements.entries()) {
			const neighbors: Parameters<Movement["createParallel"]>[1] = {}

			const previous = this.#movements[i - 1]
			if (previous) neighbors.previous = previous

			const next = this.#movements[i + 1]
			if (next) neighbors.next = next

			movements.push(movement.createParallel(gap, neighbors))
		}

		const getLastDisplacement = movements.at(-1)?.getDisplacement.bind({})
		if (!getLastDisplacement) {
			throw new UnexpectedError(
				"Empty parallel movements in spite of filled movements.",
			)
		}

		return new Path(() => getLastDisplacement().head, id, {
			movements,
		} satisfies PathInternals)
	}

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

	clone(id?: string) {
		return new Path(this.#lastDestination.bind({}), id, {
			movements: this.#movements.map((movement) => movement.clone()),
		} satisfies PathInternals)
	}

	#getterize<T, U extends () => T>(value: Exclude<T, Function> | U): () => T {
		return typeof value === "function" ? (value as U) : () => value
	}
}

export default Path
