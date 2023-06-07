import type Vector2d from "@lib/geometry/2d/classes/vector2d.class"
import type Point2d from "@lib/geometry/2d/classes/point2d.class"
import type { Coordinates2d } from "@lib/geometry/2d/types"
import type { Movement } from "@src/core/movement/types"

export type PathInternals = {
	movements: Movement[]
}

export type PathOptions = {
	id: string
	fill: string
}

export type PathStartingPoint = () => Point2d

export type LengthGetter = (lastPosition: Point2d) => number

export type Vector2dGetter = (lastPosition: Point2d) => Vector2d

export type Point2dGetter = (lastPosition: Point2d) => Point2d

export type Coordinates2dGetter = (lastPosition: Point2d) => Coordinates2d
