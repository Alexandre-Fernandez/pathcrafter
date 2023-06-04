import Styles from "@src/core/global/styles.class"
import Path from "@src/core/path/classes/path.class"
import Svg from "@src/core/svg/classes/svg.class"
import type { SvgOptions as PathcrafterOptions } from "@src/core/svg/types"

export { getBoundingDocumentRect, getDocumentSize } from "@lib/dom"
export { default as Path } from "@src/core/path/classes/path.class"
export { default as Tools } from "@src/core/tools/classes/tools.class"
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
export type { SelectorElement } from "@src/core/tools/types"
export type { Movement } from "@src/core/movement/types"
export type { Direction } from "@src/core/tools/types"
