import { generateUniqueId } from "@lib/dom"
import { assertGuard } from "@lib/ts/guards"
import Point2d from "@lib/geometry/2d/classes/point2d.class"
import Vector2d from "@lib/geometry/2d/classes/vector2d.class"
import { SVG_NAMESPACE } from "@src/constants"
import { isMovementArray } from "@src/core/movement/guards/movement.guard"
import StraightMovement from "@src/core/movement/classes/straight-movement.class"
import CubicMovement from "@src/core/movement/classes/cubic-movement.class"
import QuadraticMovement from "@src/core/movement/classes/quadratic-movement.class"
import EmptyMovements from "@src/core/path/errors/empty-movements.error"
import UnexpectedError from "@src/errors/unexpected-error.error"
import MarkerNotFound from "@src/core/path/errors/marker-not-found.error"
import type { Coordinates2d } from "@lib/geometry/2d/types"
import type { Coordinates2dGetter, LengthGetter } from "@src/types"
import type { PathInternals, PathOptions } from "@src/core/path/types"
import type { Movement } from "@src/core/movement/types"

class Path {
	#id

	#lastDestination: Movement["getDestination"]

	#movements: Movement[] = []

	#pathEl

	constructor(
		startingPoint: Coordinates2d | Coordinates2dGetter,
		options: Partial<PathOptions> = {},
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
		const { id } = { ...Path.#defaultOptions, ...options }
		this.#id = id

		// dom
		this.#pathEl = document.createElementNS(SVG_NAMESPACE, "path")
		this.#pathEl.id = this.id
	}

	static get #defaultOptions(): PathOptions {
		return {
			id: generateUniqueId(),
		}
	}

	get id() {
		return this.#id
	}

	addHorizontal(length: number | LengthGetter, marker?: string) {
		const getLength = this.#getterize(length)

		const getOrigin = this.#lastDestination.bind({})

		const getDisplacementDestination = () =>
			getOrigin().clone().add(new Point2d(getLength(), 0))

		this.#movements.push(
			new StraightMovement(
				getOrigin,
				getDisplacementDestination,
				() => new Vector2d(getDisplacementDestination(), getOrigin()),
				marker,
			),
		)

		this.#lastDestination = getDisplacementDestination

		return this
	}

	addVertical(length: number | LengthGetter, marker?: string) {
		const getLength = this.#getterize(length)

		const getOrigin = this.#lastDestination.bind({})

		const getDisplacementDestination = () =>
			getOrigin().clone().add(new Point2d(0, getLength()))

		this.#movements.push(
			new StraightMovement(
				getOrigin,
				getDisplacementDestination,
				() => new Vector2d(getDisplacementDestination(), getOrigin()),
				marker,
			),
		)

		this.#lastDestination = getDisplacementDestination

		return this
	}

	addDiagonal(length: Coordinates2d | Coordinates2dGetter, marker?: string) {
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
				marker,
			),
		)

		this.#lastDestination = getDisplacementDestination

		return this
	}

	addCubic(
		length: Coordinates2d | Coordinates2dGetter,
		startControl: Coordinates2d | Coordinates2dGetter,
		endControl: Coordinates2d | Coordinates2dGetter,
		marker?: string,
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
				marker,
			),
		)

		this.#lastDestination = getDisplacementDestination

		return this
	}

	addQuadratic(
		length: Coordinates2d | Coordinates2dGetter,
		control: Coordinates2d | Coordinates2dGetter,
		marker?: string,
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
				marker,
			),
		)

		this.#lastDestination = getDisplacementDestination

		return this
	}

	getElement() {
		return this.#pathEl
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

	createParallel(gap: number, options?: Partial<PathOptions>) {
		if (this.#movements.length === 0) throw new EmptyMovements()

		const pathOptions = { ...Path.#defaultOptions, ...options }
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

		return new Path(getLastDestination, pathOptions, {
			movements,
		} satisfies PathInternals)
	}

	createPartial(marker: string, options?: Partial<PathOptions>) {
		const index = this.#movements.findIndex(
			(movement) => movement.marker === marker,
		)
		if (index === -1) throw new MarkerNotFound(marker)

		const pathOptions = { ...Path.#defaultOptions, ...options }
		const movements = this.#movements
			.slice(0, index + 1)
			.map((movement) => movement.clone())
		const getLastDestination =
			movements.at(-1)?.getDestination.bind({}) ||
			this.#lastDestination.bind({})

		return new Path(getLastDestination, pathOptions, {
			movements,
		} satisfies PathInternals)
	}

	clone(options?: Partial<PathOptions>) {
		const pathOptions = { ...Path.#defaultOptions, ...options }
		const movements = this.#movements.map((movement) => movement.clone())
		const getLastDestination = this.#lastDestination.bind({})

		return new Path(getLastDestination, pathOptions, {
			movements,
		} satisfies PathInternals)
	}

	#getterize<T>(value: T) {
		return typeof value === "function"
			? (value as Extract<T, Function>)
			: () => value as Exclude<T, Function>
	}
}

export default Path
