import type StraightMovement from "@src/core/movement/classes/straight-movement.class"
import type CubicMovement from "@src/core/movement/classes/cubic-movement.class"
import type QuadraticMovement from "@src/core/movement/classes/quadratic-movement.class"
import type Point2d from "@lib/geometry/2d/classes/point2d.class"

export type Movement = StraightMovement | CubicMovement | QuadraticMovement

type NullablePoint2d = Point2d | null
export type SegmentDestination = {
	displacement: Point2d
	control: NullablePoint2d
	startControl: NullablePoint2d
	endControl: NullablePoint2d
}
