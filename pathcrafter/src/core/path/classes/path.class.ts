import Point2d from "@lib/geometry/2d/point2d.class"
import Vector2d from "@lib/geometry/2d/vector2d.class"
import PathInternals from "@src/core/path/classes/path-internals.class"
import StraightVectorProperties from "@src/core/path/classes/vector-properties/straight-vector-properties.class"
import CubicVectorProperties from "@src/core/path/classes/vector-properties/cubic-vector-properties.class"
import QuadraticVectorProperties from "@src/core/path/classes/vector-properties/quadratic-vector-properties.class"
import type { Coordinates2d } from "@lib/geometry/2d/types"
import type {
	Coordinates2dGetter,
	LengthGetter,
	PathStyle,
} from "@src/core/path/types"
import { SVG_NAMESPACE } from "@src/constants"

class Path {
	internals = new PathInternals()

	style: PathStyle = {
		fill: "none",
		stroke: "none",
		strokeWidth: 2,
	}

	#element

	constructor(style: Partial<PathStyle> = {}) {
		this.style = { ...this.style, ...style }

		const g = document.createElementNS(SVG_NAMESPACE, "g")
		g.append(document.createElementNS(SVG_NAMESPACE, "path"))
		this.#element = g
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
		this.internals.vectors.push(
			new StraightVectorProperties(() =>
				Vector2d.fromCoordinates(getLength(), 0),
			),
		)

		return this
	}

	vertical(length: number | LengthGetter) {
		const getLength = this.#getterize(length)
		this.internals.vectors.push(
			new StraightVectorProperties(() =>
				Vector2d.fromCoordinates(0, getLength()),
			),
		)
		return this
	}

	diagonal(length: Coordinates2d | Coordinates2dGetter) {
		const getLength = this.#getterize(length)
		this.internals.vectors.push(
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

	quadratic(
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

	clone() {
		const path = new Path()
		path.internals = this.internals.clone()
		return path
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

		this.#setElementAttribute("d", d)
			.#setElementAttribute("stroke", this.style.stroke)
			.#setElementAttribute("stroke-width", this.style.strokeWidth)

		return this.#element
	}

	#getterize<T, U extends () => T>(value: Exclude<T, Function> | U): () => T {
		return typeof value === "function" ? (value as U) : () => value
	}

	#setElementAttribute(key: string, value: string | number) {
		this.#element.setAttribute(key, `${value}`)
		return this
	}
}

export default Path
