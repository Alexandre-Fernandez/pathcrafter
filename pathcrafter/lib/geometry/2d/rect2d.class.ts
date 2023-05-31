import Point2d from "@lib/geometry/2d/point2d.class"
import InvalidRect from "@lib/geometry/errors/invalid-rect"

class Rect2d {
	constructor(
		public end: Point2d,
		public position: Point2d = new Point2d(0, 0),
	) {
		if (!Rect2d.isValid(end, position)) {
			throw new InvalidRect(position, end)
		}
	}

	static isValid(end: Point2d, position: Point2d) {
		return (
			position.x < end.x &&
			position.y < end.y &&
			(end.x - position.x) * (end.y - position.y) !== 0
		)
	}

	static fromDomRect<T extends Omit<DOMRect, "x" | "y" | "toJSON">>({
		top,
		bottom,
		right,
		left,
	}: T) {
		return new Rect2d(new Point2d(right, bottom), new Point2d(left, top))
	}

	static fromCoordinates(
		endX: number,
		endY: number,
		positionX = 0,
		positionY = 0,
	) {
		return new Rect2d(
			new Point2d(endX, endY),
			new Point2d(positionX, positionY),
		)
	}

	get area() {
		return this.width * this.height
	}

	get width() {
		return this.end.x - this.position.x
	}

	get height() {
		return this.end.y - this.position.y
	}

	get top() {
		return this.position.y
	}

	get bottom() {
		return this.end.y
	}

	get left() {
		return this.position.x
	}

	get right() {
		return this.end.x
	}

	getIntersection(rect: Rect2d) {
		const position = new Point2d(
			Math.max(this.position.x, rect.position.x), // left
			Math.max(this.position.y, rect.position.y), // top
		)

		const end = new Point2d(
			Math.min(this.end.x, rect.end.x), // right
			Math.min(this.end.y, rect.end.y), // bottom
		)

		return Rect2d.isValid(end, position) ? new Rect2d(end, position) : null
	}

	getGap(rect: Rect2d) {
		const intersection = this.getIntersection(rect)
		if (intersection) return intersection

		let left = 0
		let right = 0

		if (this.right < rect.left) {
			left = this.right
			right = rect.left
		} else if (this.left > rect.right) {
			left = rect.right
			right = this.left
		} else {
			left = Math.max(this.left, rect.left)
			right = Math.min(this.right, rect.right)
		}

		let top = 0
		let bottom = 0

		if (this.top > rect.bottom) {
			top = rect.bottom
			bottom = this.top
		} else if (this.bottom < rect.top) {
			top = this.bottom
			bottom = rect.top
		} else {
			top = Math.max(this.top, rect.top)
			bottom = Math.min(this.bottom, rect.bottom)
		}

		const position = new Point2d(left, top)
		const end = new Point2d(right, bottom)

		return Rect2d.isValid(end, position) ? new Rect2d(end, position) : null
	}
}

/*
// result
// x4.58, y6.09
// x5.86, y8.43

const rect1 = Rect2d.fromCoordinates(5.86, 9.47, 1.7, 6.09)

const rect2 = Rect2d.fromCoordinates(8.48, 13.35, 4.58, 7.13)
*/

export default Rect2d
