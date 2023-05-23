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

	#groupEl

	#pathEl

	constructor(style: Partial<PathStyle> = {}) {
		this.style = { ...this.style, ...style }

		const g = document.createElementNS(SVG_NAMESPACE, "g")
		this.#pathEl = document.createElementNS(SVG_NAMESPACE, "path")
		g.append(this.#pathEl)
		this.#groupEl = g
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

	clone() {
		const path = new Path()
		path.internals = this.internals.clone()
		return path
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

		this.#setElementAttribute("path", "d", d)
			.#setElementAttribute("path", "stroke", this.style.stroke)
			.#setElementAttribute(
				"path",
				"stroke-width",
				this.style.strokeWidth,
			)

		return this.#groupEl
	}

	#getterize<T, U extends () => T>(value: Exclude<T, Function> | U): () => T {
		return typeof value === "function" ? (value as U) : () => value
	}

	#setElementAttribute(
		el: "g" | "path",
		key: string,
		value: string | number,
	) {
		switch (el) {
			case "g": {
				this.#groupEl.setAttribute(key, `${value}`)
				break
			}
			case "path": {
				this.#pathEl.setAttribute(key, `${value}`)
				break
			}
			default: {
				break
			}
		}
		return this
	}
}

export default Path
