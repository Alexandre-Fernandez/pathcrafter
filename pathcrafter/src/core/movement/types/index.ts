import type StraightMovement from "@src/core/movement/classes/straight-movement.class"
import type CubicMovement from "@src/core/movement/classes/cubic-movement.class"
import type QuadraticMovement from "@src/core/movement/classes/quadratic-movement.class"

export type Movement = StraightMovement | CubicMovement | QuadraticMovement
