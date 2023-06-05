import type Point2d from "@lib/geometry/2d/classes/point2d.class"

class InvalidRect extends Error {
	constructor(position?: Point2d, end?: Point2d) {
		super(
			position && end
				? `"position" (${position.x}, ${position.y}) must be the top left corner, and "end" (${end.x}, ${end.y}) must be the bottom right corner.`
				: `"position"  must be the top left corner, and "end" must be the bottom right corner.`,
		)
	}
}

export default InvalidRect
