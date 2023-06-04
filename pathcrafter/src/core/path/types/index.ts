import type Vector2d from "@lib/geometry/2d/classes/vector2d.class"
import type Point2d from "@lib/geometry/2d/classes/point2d.class"
import type { Coordinates2d } from "@lib/geometry/2d/types"
import type { Movement } from "@src/core/movement/types"

export type PathInternals = {
	movements: Movement[]
}

export type PathOptions = {
	id: string
}

export type LengthGetter = () => number

export type Vector2dGetter = () => Vector2d

export type Point2dGetter = () => Point2d

export type Coordinates2dGetter = () => Coordinates2d
