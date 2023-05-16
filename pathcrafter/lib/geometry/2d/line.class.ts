import Point2d from "@lib/geometry/2d/point2d.class"
import ZeroDivision from "@lib/geometry/errors/zero-division.error"

class Line {
	constructor(public slope: number, public yIntercept: number) {}

	static fromPoints({ x: x1, y: y1 }: Point2d, { x: x2, y: y2 }: Point2d) {
		const xLength = x2 - x1
		if (xLength === 0) throw new ZeroDivision(`${x2} - ${x1}`)

		const slope = (y2 - y1) / xLength
		return new Line(slope, -slope * x1 + y1)
	}

	static fromCoordinates(x1: number, y1: number, x2: number, y2: number) {
		return Line.fromPoints(new Point2d(x1, y1), new Point2d(x2, y2))
	}
}

export default Line
