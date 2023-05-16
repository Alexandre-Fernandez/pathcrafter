import type Vector2d from "@lib/geometry/2d/vector2d.class"
import NotCardinal from "@src/core/path/errors/not-cardinal.error"

export function isCardinalDirection(vector: Vector2d) {
	if (!vector.isPositionVector()) return false
	return !vector.head
		.values()
		.some(
			(coordinate) =>
				!Number.isInteger(coordinate) ||
				coordinate < -1 ||
				coordinate > 1,
		)
}

export function assertIsCardinalDirection(direction: Vector2d) {
	if (!isCardinalDirection(direction)) {
		throw new NotCardinal(direction.toString())
	}
}
