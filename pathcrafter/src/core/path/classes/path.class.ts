import { uid } from "@lib/string"
import { assertGuard } from "@lib/ts/guards"
import Point2d from "@lib/geometry/2d/classes/point2d.class"
import Vector2d from "@lib/geometry/2d/classes/vector2d.class"
import { SVG_NAMESPACE } from "@src/constants"
import { isMovementArray } from "@src/core/movement/guards/movement.guard"
import StraightMovement from "@src/core/movement/classes/straight-movement.class"
import CubicMovement from "@src/core/movement/classes/cubic-movement.class"
import QuadraticMovement from "@src/core/movement/classes/quadratic-movement.class"
import EmptyMovements from "@src/core/path/errors/empty-movements.error"
import MarkerNotFound from "@src/core/path/errors/marker-not-found.error"
import UnexpectedError from "@src/errors/unexpected-error.error"
import type { Coordinates2d } from "@lib/geometry/2d/types"
import type { Movement, SegmentDestination } from "@src/core/movement/types"
import type {
	Coordinates2dGetter,
	LengthGetter,
	PathInternals,
	PathOptions,
	PathStartingPoint,
	Point2dGetter,
} from "@src/core/path/types"

class Path {
	fill

	stroke

	#id

	#startingPoint: PathStartingPoint

	#movements: Movement[] = []

	#pathEl

	/**
	 * Memoizes each movement's destionation during an update, this improves
	 * performances and allows to pass the correct `lastPosition` to the
	 * getters.
	 *
	 * **It should be cleared from the outside after all this and all derived
	 * paths have been updated.**
	 */
	#cache = new Map<string, Point2d>()

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
		this.#startingPoint = () => {
			const { x, y } = getStartingPoint(
				new Point2d(Number.NaN, Number.NaN),
			)
			return new Point2d(x, y)
		}
		const { id, fill, stroke } = this.#createOptions(options)
		this.#id = id
		this.fill = fill
		this.stroke = stroke

		// dom
		this.#pathEl = document.createElementNS(SVG_NAMESPACE, "path")
		this.#pathEl.setAttribute("id", this.id)
		this.#pathEl.setAttribute("fill", this.fill)
	}

	static get #defaultOptions(): PathOptions {
		return {
			id: `_${uid()}`,
			fill: "none",
			stroke: "black",
		}
	}

	/** Read-only id of this `Path` object and of the DOM element. */
	get id() {
		return this.#id
	}

	get #lastDestination() {
		const lastDestination = this.#movements.at(-1)?.getDestination
		if (!lastDestination) return this.#startingPoint
		return lastDestination
	}

	/** Adds a horizontal movement, negative is left, positive is right. */
	addHorizontal(length: number | LengthGetter, marker?: string) {
		const getLength = this.#getterize(length)

		const getOrigin = this.#lastDestination.bind({})

		const getDisplacementDestination = this.#memoDestination(
			(lastPosition: Point2d) => new Point2d(getLength(lastPosition), 0),
			getOrigin,
		)

		this.#movements.push(
			new StraightMovement(
				getOrigin,
				getDisplacementDestination,
				(lastPosition: Point2d) =>
					new Vector2d(
						getDisplacementDestination(lastPosition),
						getOrigin(lastPosition),
					),
				marker,
			),
		)

		return this
	}

	/** Adds a vertical movement, negative is up, positive is down. */
	addVertical(length: number | LengthGetter, marker?: string) {
		const getLength = this.#getterize(length)

		const getOrigin = this.#lastDestination.bind({})

		const getDisplacementDestination = this.#memoDestination(
			(lastPosition: Point2d) => new Point2d(0, getLength(lastPosition)),
			getOrigin,
		)

		this.#movements.push(
			new StraightMovement(
				getOrigin,
				getDisplacementDestination,
				(lastPosition: Point2d) =>
					new Vector2d(
						getDisplacementDestination(lastPosition),
						getOrigin(lastPosition),
					),
				marker,
			),
		)

		return this
	}

	/** Adds a diagonal movement, the Y-axis is reversed (negative is up). */
	addDiagonal(length: Coordinates2d | Coordinates2dGetter, marker?: string) {
		const getLength = this.#getterize(length)

		const getOrigin = this.#lastDestination.bind({})

		const getDisplacementDestination = this.#memoDestination(
			getLength,
			getOrigin,
		)

		this.#movements.push(
			new StraightMovement(
				getOrigin,
				getDisplacementDestination,
				(lastPosition: Point2d) =>
					new Vector2d(
						getDisplacementDestination(lastPosition),
						getOrigin(lastPosition),
					),
				marker,
			),
		)

		return this
	}

	/** Adds a cubic bezier movement, the Y-axis is reversed (negative is up). */
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

		const getDisplacementDestination = (lastPosition: Point2d) => {
			const { x, y } = getLength(lastPosition)
			return getOrigin(lastPosition).clone().add(new Point2d(x, y))
		}
		const getStartControlDestination = (lastPosition: Point2d) => {
			const { x, y } = getStartControl(lastPosition)
			return getOrigin(lastPosition).clone().add(new Point2d(x, y))
		}
		const getEndControlDestination = (lastPosition: Point2d) => {
			const { x, y } = getEndControl(lastPosition)
			return getDisplacementDestination(lastPosition)
				.clone()
				.add(new Point2d(x, y))
		}

		this.#movements.push(
			new CubicMovement(
				getOrigin,
				getDisplacementDestination,
				(lastPosition: Point2d) =>
					new Vector2d(
						getDisplacementDestination(lastPosition),
						getOrigin(lastPosition),
					),
				(lastPosition: Point2d) =>
					new Vector2d(
						getStartControlDestination(lastPosition),
						getOrigin(lastPosition),
					),
				(lastPosition: Point2d) =>
					new Vector2d(
						getEndControlDestination(lastPosition),
						getDisplacementDestination(lastPosition),
					),
				marker,
			),
		)

		return this
	}

	/** Adds a quadratic movement, the Y-axis is reversed (negative is up). */
	addQuadratic(
		length: Coordinates2d | Coordinates2dGetter,
		control: Coordinates2d | Coordinates2dGetter,
		marker?: string,
	) {
		const getLength = this.#getterize(length)
		const getControl = this.#getterize(control) // starts from origin

		const getOrigin = this.#lastDestination.bind({})

		const getDisplacementDestination = (lastPosition: Point2d) => {
			const { x, y } = getLength(lastPosition)
			return getOrigin(lastPosition).clone().add(new Point2d(x, y))
		}
		const getControlDestination = (lastPosition: Point2d) => {
			const { x, y } = getControl(lastPosition)
			return getOrigin(lastPosition).clone().add(new Point2d(x, y))
		}

		this.#movements.push(
			new QuadraticMovement(
				getOrigin,
				getDisplacementDestination,
				(lastPosition: Point2d) =>
					new Vector2d(
						getDisplacementDestination(lastPosition),
						getOrigin(lastPosition),
					),
				(lastPosition: Point2d) =>
					new Vector2d(
						getControlDestination(lastPosition),
						getOrigin(lastPosition),
					),
				marker,
			),
		)

		return this
	}

	/**
	 * **Only use if you know what you're doing.**
	 *
	 * Clears this path's cache.
	 * This will make the movement functions rerun when the path is updated.
	 * The cache should only be cleared when this and all derived paths have
	 * been updated.
	 */
	clearCache() {
		this.#cache.clear()
		return this
	}

	/** Returns the DOM element corresponding to this object. */
	getElement() {
		return this.#pathEl
	}

	/** Updates the DOM element's attributes. */
	updateElement() {
		let d = ""

		let previousDestination = this.#startingPoint()

		for (const [i, movement] of this.#movements.entries()) {
			const destination: SegmentDestination = {
				displacement:
					movement.getDisplacement(previousDestination).head,
				control:
					movement instanceof QuadraticMovement
						? movement.getControl(previousDestination).head
						: null,
				startControl:
					movement instanceof CubicMovement
						? movement.getStartControl(previousDestination).head
						: null,
				endControl:
					movement instanceof CubicMovement
						? movement.getEndControl(previousDestination).head
						: null,
			}
			d +=
				i === 0 //
					? movement.toSegment(destination, previousDestination)
					: ` ${movement.toSegment(destination)}`

			previousDestination = destination.displacement
		}

		this.#pathEl.setAttribute("d", d)
		this.#pathEl.setAttribute("fill", this.fill)
		this.#pathEl.setAttribute("stroke", this.stroke)

		return this
	}

	/**
	 * Derives a parallel path from this one.
	 * @param gap The positive or negative gap describes the gap between this
	 * path and the derived one.
	 */
	deriveParallel(gap: number, options?: Partial<PathOptions>) {
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

		const clonedStartingPoint = this.#startingPoint.bind({})
		const clonedFirstDisplacement = this.#movements
			.at(0)
			?.getDisplacement.bind({})

		if (!clonedFirstDisplacement) {
			throw new UnexpectedError(
				"First displacement cannot be undefined because movements are not empty",
			)
		}

		const getStartingPoint = () =>
			clonedFirstDisplacement(
				clonedStartingPoint(),
			).perpendicularTranslate(gap).tail

		return new Path(getStartingPoint, this.#createOptions(options), {
			movements,
		} satisfies PathInternals)
	}

	/**
	 * Derives a parallel path from this one.
	 * @param marker The marker will look for markers on a movement and derive a
	 * new path from this one including everything up to that point.
	 */
	derivePartial(marker: string, options?: Partial<PathOptions>) {
		const index = this.#movements.findIndex(
			(movement) => movement.marker === marker,
		)
		if (index === -1) throw new MarkerNotFound(marker)

		const movements = this.#movements
			.slice(0, index + 1)
			.map((movement) => movement.clone())
		const getStartingPoint =
			movements.at(0)?.getOrigin || this.#startingPoint

		return new Path(getStartingPoint, this.#createOptions(options), {
			movements,
		} satisfies PathInternals)
	}

	/** Derives an identical path from this one. */
	derive(options?: Partial<PathOptions>) {
		const movements = this.#movements.map((movement) => movement.clone())

		return new Path(
			this.#startingPoint.bind({}),
			this.#createOptions(options),
			{
				movements,
			} satisfies PathInternals,
		)
	}

	#createOptions(options?: Partial<PathOptions>) {
		return { ...Path.#defaultOptions, ...options }
	}

	#getterize<T>(value: T) {
		return typeof value === "function"
			? (value as Extract<T, Function>)
			: () => value as Exclude<T, Function>
	}

	#memoDestination(getLength: Coordinates2dGetter, getOrigin: Point2dGetter) {
		const id = uid()
		return (lastPosition: Point2d) => {
			const cached = this.#cache.get(id)
			if (cached) return cached
			const { x, y } = getLength(lastPosition)
			const result = getOrigin(lastPosition)
				.clone()
				.add(new Point2d(x, y))
			this.#cache.set(id, result)
			return result
		}
	}
}

export default Path
