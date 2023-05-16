import Point2d from "@lib/geometry/2d/point2d.class"
import ZeroDivision from "@lib/geometry/errors/zero-division.error"

class Line2d {
	constructor(public slope: number, public yIntercept: number) {}

	static fromPoints({ x: x1, y: y1 }: Point2d, { x: x2, y: y2 }: Point2d) {
		const xLength = x2 - x1
		if (xLength === 0) throw new ZeroDivision(`${x2} - ${x1}`)

		const slope = (y2 - y1) / xLength
		return new Line2d(slope, -slope * x1 + y1)
	}

	static fromCoordinates(x1: number, y1: number, x2: number, y2: number) {
		return Line2d.fromPoints(new Point2d(x1, y1), new Point2d(x2, y2))
	}

	has(x: number, y: number) {
		return y === this.slope * x + this.yIntercept
	}

	intersects({ slope, yIntercept }: Line2d) {
		const slopeDifference = this.slope - slope
		if (slopeDifference === 0) return null
		const x = (yIntercept - this.yIntercept) / slopeDifference
		return new Point2d(x, this.slope * x + this.yIntercept)
	}
}

export default Line2d
