import type Point2d from "@lib/geometry/2d/point2d.class"
import type { Coordinates2d } from "@lib/geometry/2d/types"
import type Vector2d from "@lib/geometry/2d/vector2d.class"

export type LengthGetter = () => number

export type Vector2dGetter = () => Vector2d

export type Point2dGetter = () => Point2d

export type Coordinates2dGetter = () => Coordinates2d
