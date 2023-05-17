import type Point2d from "@lib/geometry/2d/point2d.class"
import type { Coordinates2d } from "@lib/geometry/2d/types"
import type Vector2d from "@lib/geometry/2d/vector2d.class"
import type SegmentType from "@src/core/path/enums/segment-type.enum"

export type LengthGetter = () => number

export type Vector2dGetter = () => Vector2d

export type Point2dGetter = () => Point2d

export type Coordinates2dGetter = () => Coordinates2d

interface BaseVectorProperties {
	getDisplacement: Vector2dGetter
}

interface StraightVectorProperties extends BaseVectorProperties {
	type: SegmentType.Straight
}

interface CubicVectorProperties extends BaseVectorProperties {
	type: SegmentType.Cubic
	getStartControl: Vector2dGetter
	getEndControl: Vector2dGetter
}

interface QuadraticVectorProperties extends BaseVectorProperties {
	type: SegmentType.Quadratic
	getControl: Vector2dGetter
}

export type VectorProperties =
	| StraightVectorProperties
	| CubicVectorProperties
	| QuadraticVectorProperties
