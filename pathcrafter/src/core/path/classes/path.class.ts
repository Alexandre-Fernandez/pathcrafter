import Point2d from "@lib/geometry/2d/point2d.class"
import Vector2d from "@lib/geometry/2d/vector2d.class"
import PathInternals from "@src/core/path/classes/path-internals.class"
import NoStartingPoint from "@src/core/path/errors/no-starting-point.error"
import StraightVectorProperties from "@src/core/path/classes/straight-vector-properties.class"
import CubicVectorProperties from "@src/core/path/classes/cubic-vector-properties.class"
import QuadraticVectorProperties from "@src/core/path/classes/quadratic-vector-properties.class"
import type { Coordinates2d } from "@lib/geometry/2d/types"
import type { Coordinates2dGetter, LengthGetter } from "@src/core/path/types"
import type { PathInternalsVectorProperties } from "@src/core/path/classes/path-internals.class"

class Path {
	internals = new PathInternals()

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

	toElement() {
		let d = ""

		this.#forEachTranslatedVectorProperties((vectorProperties, i) => {
			if (i === 0) {
				d += vectorProperties.toSegment(true)
				return
			}
			d += ` ${vectorProperties.toSegment()}`
		})

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

	#forEachTranslatedVectorProperties(
		callback: (
			vectorProperties: PathInternalsVectorProperties,
			index: number,
		) => any,
	) {
		if (!this.internals.start) throw new NoStartingPoint()

		const [first, ...vectorProperties] = this.internals.vectorProperties
		if (!first) return

		const startingPoint = this.internals.start()
		const translatedFirst = first
			.clone()
			.translate(startingPoint.x, startingPoint.y)

		callback(translatedFirst, 0)

		let lastTranslatedHead = translatedFirst.getDisplacement().head

		for (const [i, item] of vectorProperties.entries()) {
			const translated = item
				.clone()
				.translate(lastTranslatedHead.x, lastTranslatedHead.y)

			lastTranslatedHead = translated.getDisplacement().head

			callback(translated, i + 1)
		}
	}

	#getterize<T, U extends () => T>(value: Exclude<T, Function> | U): () => T {
		return typeof value === "function" ? (value as U) : () => value
	}
}

export default Path
