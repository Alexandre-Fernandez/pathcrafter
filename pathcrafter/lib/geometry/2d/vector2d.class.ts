import Point2d from "@lib/geometry/2d/point2d.class"
import ZeroDivision from "@lib/geometry/errors/zero-division.error"

class Vector2d {
	static get TOP() {
		return Vector2d.fromCoordinates(0, -1)
	}

	static get RIGHT() {
		return Vector2d.fromCoordinates(1, 0)
	}

	static get BOTTOM() {
		return Vector2d.fromCoordinates(0, 1)
	}

	static get LEFT() {
		return Vector2d.fromCoordinates(-1, 0)
	}

	static get TOP_RIGHT() {
		return Vector2d.fromCoordinates(1, -1)
	}

	static get TOP_LEFT() {
		return Vector2d.fromCoordinates(-1, -1)
	}

	static get BOTTOM_RIGHT() {
		return Vector2d.fromCoordinates(1, 1)
	}

	static get BOTTOM_LEFT() {
		return Vector2d.fromCoordinates(-1, 1)
	}

	constructor(public head: Point2d, public tail = new Point2d(0, 0)) {}

	static fromCoordinates(headX: number, headY: number, tailX = 0, tailY = 0) {
		return new Vector2d(
			new Point2d(headX, headY),
			new Point2d(tailX, tailY),
		)
	}

	translate(x: number, y: number) {
		this.head.x += x
		this.head.y += y
		this.tail.x += x
		this.tail.y += y
		return this
	}

	translateX(x: number) {
		this.head.x += x
		this.tail.x += x
		return this
	}

	translateY(y: number) {
		this.head.y += y
		this.tail.y += y
		return this
	}

	length() {
		const x = this.head.x - this.tail.x
		const y = this.head.y - this.tail.y
		return Math.sqrt(x * x + y * y)
	}

	equals({ head, tail }: Vector2d) {
		return (
			this.head.x - this.tail.x - (head.x - tail.x) === 0 &&
			this.head.y - this.tail.y - (head.y - tail.y) === 0
		)
	}

	abs() {
		this.head.x = Math.abs(this.head.x)
		this.head.y = Math.abs(this.head.y)
		this.tail.x = Math.abs(this.tail.x)
		this.tail.y = Math.abs(this.tail.y)
		return this
	}

	normalize() {
		return this.divideByScalar(this.length())
	}

	divideByScalar(scalar: number) {
		if (scalar === 0) {
			throw new ZeroDivision(
				`(${this.tail.x}, ${this.tail.y})->(${this.head.x}, ${this.head.y})`,
			)
		}
		this.head.x /= scalar
		this.head.y /= scalar
		this.tail.x /= scalar
		this.tail.y /= scalar
		return this
	}

	isPositionVector() {
		return this.tail.x === 0 && this.tail.y === 0
	}

	clone() {
		return Vector2d.fromCoordinates(
			this.head.x,
			this.head.y,
			this.tail.x,
			this.tail.y,
		)
	}
}

export default Vector2d
