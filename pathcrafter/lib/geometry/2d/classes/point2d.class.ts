import type { Coordinates2d } from "@lib/geometry/2d/types"

class Point2d implements Coordinates2d {
	constructor(public x: number, public y: number) {}

	static fromCoordinates2d({ x, y }: Coordinates2d) {
		return new Point2d(x, y)
	}

	add({ x, y }: Coordinates2d) {
		this.x += x
		this.y += y
		return this
	}

	equals({ x, y }: Coordinates2d) {
		return this.x === x && this.y === y
	}

	clone() {
		return new Point2d(this.x, this.y)
	}

	values() {
		return [this.x, this.y]
	}

	toString() {
		return `(${this.x}, ${this.y})`
	}
}

export default Point2d
