class Point2d {
	constructor(public x: number, public y: number) {}

	equals({ x, y }: Point2d) {
		return this.x === x && this.y === y
	}

	clone() {
		return new Point2d(this.x, this.y)
	}
}

export default Point2d
