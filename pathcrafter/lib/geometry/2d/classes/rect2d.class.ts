import Point2d from "@lib/geometry/2d/classes/point2d.class"
import InvalidRect from "@lib/geometry/errors/invalid-rect"
import { Coordinates2d } from "@src"

class Rect2d {
	end: Point2d

	position: Point2d

	constructor(
		end: Coordinates2d,
		position: Coordinates2d = new Point2d(0, 0),
	) {
		this.end = new Point2d(end.x, end.y)
		this.position = new Point2d(position.x, position.y)

		if (!Rect2d.isValid(this.end, this.position)) {
			throw new InvalidRect(this.position, this.end)
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
			Math.max(this.left, rect.left),
			Math.max(this.top, rect.top),
		)

		const end = new Point2d(
			Math.min(this.right, rect.right),
			Math.min(this.bottom, rect.bottom),
		)

		return Rect2d.isValid(end, position) ? new Rect2d(end, position) : null
	}

	getGap(rect: Rect2d, returnIntersection = false) {
		const intersection = this.getIntersection(rect)
		if (intersection) return returnIntersection ? intersection : null

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

	toString() {
		return `⇱${this.position.toString()} ⇲${this.end.toString()}`
	}
}

export default Rect2d
