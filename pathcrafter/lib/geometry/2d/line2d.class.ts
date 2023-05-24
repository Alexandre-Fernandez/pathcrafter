import Point2d from "@lib/geometry/2d/point2d.class"
import XLine2d from "@lib/geometry/2d/x-line2d.class"
import YLine2d from "@lib/geometry/2d/y-line2d.class"

class Line2d<T extends XLine2d | YLine2d = XLine2d | YLine2d> {
	constructor(public equation: T) {}

	static fromPoints({ x: x1, y: y1 }: Point2d, { x: x2, y: y2 }: Point2d) {
		const xLength = x2 - x1
		if (xLength === 0) return new Line2d(new XLine2d(x1))

		const slope = (y2 - y1) / xLength
		return new Line2d(new YLine2d(slope, -slope * x1 + y1))
	}

	static fromCoordinates(x1: number, y1: number, x2: number, y2: number) {
		return Line2d.fromPoints(new Point2d(x1, y1), new Point2d(x2, y2))
	}

	intersects({ equation }: Line2d) {
		if (this.equation instanceof YLine2d) {
			return equation instanceof YLine2d
				? this.#yyLineIntersection(this.equation, equation)
				: this.#xyLineIntersection(equation, this.equation)
		}

		return equation instanceof XLine2d
			? null
			: this.#xyLineIntersection(this.equation, equation)
	}

	clone() {
		return new Line2d(this.equation)
	}

	#xyLineIntersection(line2: XLine2d, line1: YLine2d) {
		return new Point2d(
			line2.xIntersect,
			line1.slope * line2.xIntersect + line1.yIntercept,
		)
	}

	#yyLineIntersection(line1: YLine2d, line2: YLine2d) {
		const slopeDifference = line1.slope - line2.slope
		if (slopeDifference === 0) return null
		const x = (line2.yIntercept - line1.yIntercept) / slopeDifference
		return new Point2d(x, line1.slope * x + line1.yIntercept)
	}
}

export default Line2d
