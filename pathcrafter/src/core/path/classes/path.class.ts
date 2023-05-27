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

		const getOrigin = this.#lastDestination.bind({})

		const getDisplacementDestination = () =>
			getOrigin().clone().add(new Point2d(getLength(), 0))

		this.#movements.push(
			new StraightMovement(
				getOrigin,
				getDisplacementDestination,
				() => new Vector2d(getDisplacementDestination(), getOrigin()),
			),
		)

		this.#lastDestination = getDisplacementDestination

		return this
	}

	addVertical(length: number | LengthGetter) {
		const getLength = this.#getterize(length)

		const getOrigin = this.#lastDestination.bind({})

		const getDisplacementDestination = () =>
			getOrigin().clone().add(new Point2d(0, getLength()))

		this.#movements.push(
			new StraightMovement(
				getOrigin,
				getDisplacementDestination,
				() => new Vector2d(getDisplacementDestination(), getOrigin()),
			),
		)

		this.#lastDestination = getDisplacementDestination

		return this
	}

	addDiagonal(length: Coordinates2d | Coordinates2dGetter) {
		const getLength = this.#getterize(length)

		const getOrigin = this.#lastDestination.bind({})

		const getDisplacementDestination = () => {
			const { x, y } = getLength()
			return getOrigin().clone().add(new Point2d(x, y))
		}

		this.#movements.push(
			new StraightMovement(
				getOrigin,
				getDisplacementDestination,
				() => new Vector2d(getDisplacementDestination(), getOrigin()),
			),
		)

		this.#lastDestination = getDisplacementDestination

		return this
	}

	addCubic(
		length: Coordinates2d | Coordinates2dGetter,
		startControl: Coordinates2d | Coordinates2dGetter,
		endControl: Coordinates2d | Coordinates2dGetter,
	) {
		const getLength = this.#getterize(length)
		const getStartControl = this.#getterize(startControl) // starts from origin
		const getEndControl = this.#getterize(endControl) // starts from destination

		const getOrigin = this.#lastDestination.bind({})

		const getDisplacementDestination = () => {
			const { x, y } = getLength()
			return getOrigin().clone().add(new Point2d(x, y))
		}
		const getStartControlDestination = () => {
			const { x, y } = getStartControl()
			return getOrigin().clone().add(new Point2d(x, y))
		}
		const getEndControlDestination = () => {
			const { x, y } = getEndControl()
			return getDisplacementDestination().clone().add(new Point2d(x, y))
		}

		this.#movements.push(
			new CubicMovement(
				getOrigin,
				getDisplacementDestination,
				() => new Vector2d(getDisplacementDestination(), getOrigin()),
				() => new Vector2d(getStartControlDestination(), getOrigin()),
				() =>
					new Vector2d(
						getEndControlDestination(),
						getDisplacementDestination(),
					),
			),
		)

		this.#lastDestination = getDisplacementDestination

		return this
	}

	addQuadratic(
		length: Coordinates2d | Coordinates2dGetter,
		control: Coordinates2d | Coordinates2dGetter,
	) {
		const getLength = this.#getterize(length)
		const getControl = this.#getterize(control) // starts from origin

		const getOrigin = this.#lastDestination.bind({})

		const getDisplacementDestination = () => {
			const { x, y } = getLength()
			return getOrigin().clone().add(new Point2d(x, y))
		}
		const getControlDestination = () => {
			const { x, y } = getControl()
			return getOrigin().clone().add(new Point2d(x, y))
		}

		this.#movements.push(
			new QuadraticMovement(
				getOrigin,
				getDisplacementDestination,
				() => new Vector2d(getDisplacementDestination(), getOrigin()),
				() => new Vector2d(getControlDestination(), getOrigin()),
			),
		)

		this.#lastDestination = getDisplacementDestination

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

		const getLastDestination = movements.at(-1)?.getDestination.bind({})
		if (!getLastDestination) {
			throw new UnexpectedError(
				"Empty parallel movements in spite of filled movements.",
			)
		}

		return new Path(getLastDestination, id, {
			movements,
		} satisfies PathInternals)
	}

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
