import { generateUniqueId } from "@lib/dom"
import Point2d from "@lib/geometry/2d/point2d.class"
import Vector2d from "@lib/geometry/2d/vector2d.class"
import PathInternals from "@src/core/path/classes/path-internals.class"
import StraightVectorProperties from "@src/core/path/classes/vector-properties/straight-vector-properties.class"
import CubicVectorProperties from "@src/core/path/classes/vector-properties/cubic-vector-properties.class"
import QuadraticVectorProperties from "@src/core/path/classes/vector-properties/quadratic-vector-properties.class"
import { SVG_NAMESPACE } from "@src/constants"
import type { Coordinates2d } from "@lib/geometry/2d/types"
import type {
	Coordinates2dGetter,
	LengthGetter,
	VectorProperties,
} from "@src/core/path/types"

class Path {
	internals = new PathInternals()

	#id

	#groupEl

	#pathEl

	constructor(id = generateUniqueId()) {
		this.#id = id

		this.#pathEl = document.createElementNS(SVG_NAMESPACE, "path")

		this.#groupEl = document.createElementNS(SVG_NAMESPACE, "g")
		this.#groupEl.id = this.id

		this.#groupEl.append(this.#pathEl)
	}

	get id() {
		return this.#id
	}

	setStart(startingPoint: Coordinates2d | Coordinates2dGetter | null) {
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

	addHorizontal(length: number | LengthGetter) {
		const getLength = this.#getterize(length)
		this.internals.vectors.push(
			new StraightVectorProperties(() =>
				Vector2d.fromCoordinates(getLength(), 0),
			),
		)

		return this
	}

	addVertical(length: number | LengthGetter) {
		const getLength = this.#getterize(length)
		this.internals.vectors.push(
			new StraightVectorProperties(() =>
				Vector2d.fromCoordinates(0, getLength()),
			),
		)
		return this
	}

	addDiagonal(length: Coordinates2d | Coordinates2dGetter) {
		const getLength = this.#getterize(length)
		this.internals.vectors.push(
			new StraightVectorProperties(() => {
				const { x, y } = getLength()
				return Vector2d.fromCoordinates(x, y)
			}),
		)
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

		this.internals.forEachTranslatedVector((vector, i) => {
			if (i === 0) {
				d += vector.toSegment(true)
				return
			}
			d += ` ${vector.toSegment()}`
		})

		this.#pathEl.setAttribute("d", d)

		return this
	}

	getParallel(gap: number) {
		const parallel: VectorProperties[] = []

		const translatedVectors = this.internals.getTranslatedVectors()

		for (const [i, vector] of translatedVectors.entries()) {
			const lastIndex = translatedVectors.length - 1

			const nextVector = translatedVectors[Math.min(i + 1, lastIndex)]
			const previousVector = translatedVectors[Math.max(0, i - 1)]

			if (i === 0) {
				parallel.push(
					vector.toGapped(
						gap,
						undefined,
						nextVector?.getDisplacement,
					),
				)
				continue
			}

			if (i === lastIndex) {
				parallel.push(
					vector.toGapped(gap, previousVector?.getDisplacement),
				)
				continue
			}

			parallel.push(
				vector.toGapped(
					gap,
					previousVector?.getDisplacement,
					nextVector?.getDisplacement,
				),
			)
		}

		const path = new Path()
		path.internals.vectors = parallel
		path.internals.start = () => parallel[0]!.getDisplacement().tail

		return path
	}

	clone() {
		const path = new Path()
		path.internals = this.internals.clone()
		return path
	}

	#getterize<T, U extends () => T>(value: Exclude<T, Function> | U): () => T {
		return typeof value === "function" ? (value as U) : () => value
	}
}

export default Path
