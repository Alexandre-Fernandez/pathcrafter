import { isArray } from "@lib/ts/guards"
import CubicMovement from "@src/core/movement/classes/cubic-movement.class"
import QuadraticMovement from "@src/core/movement/classes/quadratic-movement.class"
import StraightMovement from "@src/core/movement/classes/straight-movement.class"
import type { Movement } from "@src/core/movement/types"

export function isMovement(movement: unknown): movement is Movement {
	return (
		movement instanceof StraightMovement ||
		movement instanceof CubicMovement ||
		movement instanceof QuadraticMovement
	)
}

export function isMovementArray(
	movementArray: unknown,
): movementArray is Movement[] {
	if (!isArray(movementArray)) return false
	return movementArray.every((movement) => isMovement(movement))
}
