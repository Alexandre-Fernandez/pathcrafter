import Styles from "@src/core/global/styles.class"
import Path from "@src/core/path/classes/path.class"
import Svg from "@src/core/svg/svg.class"
import { SvgOptions as PathcrafterOptions } from "@src/core/svg/types"

export { getBoundingDocumentRect, getDocumentSize } from "@lib/dom"
export { default as Path } from "@src/core/path/classes/path.class"
export { xY, edgePoint, gapRect, xGap, yGap } from "@src/utilities/functions"
export { default as StraightMovement } from "@src/core/movement/classes/straight-movement.class"
export { default as CubicMovement } from "@src/core/movement/classes/cubic-movement.class"
export { default as QuadraticMovement } from "@src/core/movement/classes/quadratic-movement.class"

export function pathcrafter(
	paths: Path[],
	options: Partial<PathcrafterOptions> = {},
) {
	Styles.init()
	return new Svg(paths, options)
}

export type { Coordinates2d } from "@lib/geometry/2d/types"
export type { PathOptions } from "@src/core/path/types"
export type { SvgOptions as PathcrafterOptions } from "@src/core/svg/types"
export type { SelectorElement } from "@src/utilities/types"
export type { LengthGetter, Coordinates2dGetter } from "@src/types"
export type { Movement } from "@src/core/movement/types"
