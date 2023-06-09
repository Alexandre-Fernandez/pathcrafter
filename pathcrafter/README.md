<div align="center" >
    <img src="https://github.com/Alexandre-Fernandez/pathcrafter/blob/main/img/logo.png" alt="pathcrafter logo" width="66%">
    <br/>
	<h1>pathcrafter</h1>
    <p>Create responsive document-relative SVG paths programmatically.</p>
</div>

## Features

-   🪶 Lightweight
-   🔧 Dynamic SVG paths
-   🕊️ DOM-indepedent
-   🔒 Type-safety and autocompletion

## Introduction

With pathcrafter you can easily create absolute positionned (relative to the document root) SVG paths programmatically. To compensate its absolute positionning, pathcrafter provides many utilities to maintain the ability to work with DOM elements.
This unlocks many possibilities such as making a responsive line between two elements in totally different containers.

## Installation

```yml
# npm
npm install pathcrafter
# yarn
yarn add pathcrafter
# pnpm
pnpm add pathcrafter
```

## Get started

Let's create a SVG path, for that we will need a starting point, don't forget, **all pathcrafter coordinates are global** (relative to the document root) and **the Y axis is reversed** (top is negative, bottom is positive).
By default generated paths are stroke-only.

```ts
import { Path } from "pathcrafter"

// defines a path that starts at the document's top-left :
new Path({ x: 0, y: 0 })
// you can also use a getter :
new Path(() => ({ x: 0, y: 0 }))
```

If we want to position the starting point relative to an element we can use the getter syntax and `getElementEdgePoint`.

```ts
import { Path, getElementEdgePoint } from "pathcrafter"

const div1 = document.querySelector("#div1")

// this path will start on div1's bottom edge at exactly 25% from its left :
new Path(() => getElementEdgePoint(div1, "bottom", 25))
// we can also make it start 10 pixel below the same point :
new Path(() => {
	const { x, y } = getElementEdgePoint(div1, "bottom", 25)
	return {
		x,
		y: y + 10,
	}
})
```

There's all sort of utilities to position your paths relatively to DOM elements.
Now that we know how to add a starting point we can see how to add segments to a Path. Be aware that **paths segments will always start where you left before** and that **you cannot remove a segment once you add it**.

```ts
import { Path, getElementEdgePoint } from "pathcrafter"

const div1 = document.querySelector("#div1")

new Path(() => getElementEdgePoint(div1, "bottom", 25))
	.addVertical(50) // adding a vertical segment that goes 50px in the bottom direction
	.addDiagonal(() => ({ x: 60, y: 20 })) // diagonal segment that goes 60px to the left and 20px down
```

Let's link two elements together.

```ts
import { Path, getElementEdgePoint, getDistance } from "pathcrafter"

const div1 = document.querySelector("#div1")
const div2 = document.querySelector("#div2")

new Path(() => getElementEdgePoint(div1, "right", 0))
	// getters receive the last position as their first parameter, this will be where
	// the previous segment left off, or the starting point if it's the first segment
	.addDiagonal((lastPosition) => {
		const endingPoint = getElementEdgePoint(div2, "left", 100)
		return getDistance(lastPosition, endingPoint)
	})
```

Once we have our path we just have to plug it into the `pathcrafter` function. So that it can be rendered on the DOM. If we want it to be responsive we can use the `update` callback function to rerun all the getters, whenever we need to.
For that we can use `addEventListener`, `MutationObserver`, etc...

```ts
import {
	Path,
	pathcrafter,
	getElementEdgePoint,
	getDistance,
} from "pathcrafter"

const div1 = document.querySelector("#div1")
const div2 = document.querySelector("#div2")

const pathBetweenDiv1AndDiv2 = new Path(() =>
	getElementEdgePoint(div1, "right", 0),
).addDiagonal((lastPosition) => {
	const endingPoint = getElementEdgePoint(div2, "left", 100)
	return getDistance(lastPosition, endingPoint)
})

const { update } = pathcrafter([pathBetweenDiv1AndDiv2]) // array of paths
window.addEventListener("resize", update) // updating path on window resize
```

You can give multiple paths to the `pathcrafter` function, however **all grouped paths will have the same stroke width**. If you need different stroke widths you can use `pathcrafter` multiple times for each stroke width.

## Reference

### `Path`

`Path` is the class used to create SVG paths.

```ts
class Path {
	/** Read-only id of this `Path` object and of the DOM element. */
	id: string = generateUniqueId()

	fill: string = "none"

	stroke: string = "black"

	constructor(
		startingPoint: Coordinates2d | Coordinates2dGetter,
		options?: Partial<PathOptions> = {},
	) {}

	/** Adds a horizontal movement, negative is left, positive is right. */
	addHorizontal(length: number | LengthGetter, marker?: string): this {}

	/** Adds a vertical movement, negative is up, positive is down. */
	addVertical(length: number | LengthGetter, marker?: string): this {}

	/** Adds a diagonal movement, the Y-axis is reversed (negative is up). */
	addDiagonal(
		length: Coordinates2d | Coordinates2dGetter,
		marker?: string,
	): this {}

	/** Adds a cubic bezier movement, the Y-axis is reversed (negative is up). */
	addCubic(
		length: Coordinates2d | Coordinates2dGetter,
		startControl: Coordinates2d | Coordinates2dGetter,
		endControl: Coordinates2d | Coordinates2dGetter,
		marker?: string,
	): this {}

	/** Adds a quadratic movement, the Y-axis is reversed (negative is up). */
	addQuadratic(
		length: Coordinates2d | Coordinates2dGetter,
		control: Coordinates2d | Coordinates2dGetter,
		marker?: string,
	): this {}

	/**
	 * **Only use if you know what you're doing.**
	 *
	 * Clears this path's cache.
	 * This will make the movement functions rerun when the path is updated.
	 * The cache should only be cleared when this and all derived paths have
	 * been updated.
	 */
	clearCache(): this {}

	/** Returns the DOM element corresponding to this object. */
	getElement(): Element {}

	/** Updates the DOM element's attributes. */
	updateElement(): this {}

	/**
	 * Derives a parallel path from this one.
	 * @param gap The positive or negative gap describes the gap between this
	 * path and the derived one.
	 */
	deriveParallel(gap: number, options?: Partial<PathOptions>): Path {}

	/**
	 * Derives a parallel path from this one.
	 * @param marker The marker will look for markers on a movement and derive a
	 * new path from this one including everything up to that point.
	 */
	derivePartial(marker: string, options?: Partial<PathOptions>): Path {}

	/** Derives an identical path from this one. */
	derive(options?: Partial<PathOptions>): Path {}
}
```

The `Path` constructor takes the following options.

```ts
interface PathOptions {
	id: string
	fill: string
	stroke: string
}
```

Derived paths reference the parent path movements and can modify their return values before applying them.
Each movement getter should (and will if used with `pathcrafter`) only run once per Path (including derived paths) per update.

### `pathcrafter`

The `pathcrafter` function manages your created `Path`, it displays and updates them when needed.

```ts
function pathcrafter(
	paths: Path[],
	options: Partial<PathcrafterOptions> = {},
): { update: () => void } {}
```

The `pathcrafter` function takes the following options.

```ts
interface PathcrafterOptions {
	id: string
	strokeWidth: number | string
}
```

### `getElementRect`

The `getElementRect` function returns an elements rectangle relative to the `Document`.

```ts
function getElementRect(element: SelectorElement): Rect2d {}
```

### `getElementEdgePoint`

The `getElementEdgePoint` function returns a point from the edge of an element's rectangle. `edge` can be `"top"`, `"bottom"`, `"right"` or `"left"`, and `percentage` refers to the distance in % from the top of the edge for vertical edges or from the left of the edge for horizontal edges.

```ts
function getElementEdgePoint(
	element: SelectorElement,
	edge: Direction,
	percentage: number,
): Point2d {}
```

### `getDistance`

The `getDistance` function simply performs a substraction between `destination` and `position` giving you the distance between the two points. If `position` and `destination` are numbers then it will return a number otherwise if `position` and `destination` are `Coordinates2d` (`{ x: number, y: number }`) it will return a `Coordinates2d`.

```ts
function getDistance<T extends number | Coordinates2d>(
	position: T,
	destination: T,
): T extends number ? number : Coordinates2d {}
```

### `getGapRect`

The `getGapRect` function return a rectangle corresponding to a gap between two elements. If the elements intersect it will return `null`.

```ts
function getGapRect(
	element1: SelectorElement,
	element2: SelectorElement,
): Rect2d | null {}
```

### `getGapX`

The `getGapX` function return a `percentage` of the horizontal gap between two elements. This can be useful if you want to position your path between two element.

```ts
function getGapX(
	element1: SelectorElement,
	element2: SelectorElement,
	percentage = 100,
): number {}
```

### `getGapY`

The `getGapY` function return a `percentage` of the vertical gap between two elements. This can be useful if you want to position your path between two element.

```ts
function getGapY(
	element1: SelectorElement,
	element2: SelectorElement,
	percentage = 100,
): number {}
```

### `createPoint2d`

Creates a `Point2d` from a X and Y. You can use this function to create 2D coordinates easily.

```ts
function createPoint2d(x: number, y: number): Point2d {}
```

```ts
class Point2d implements Coordinates2d {
	x: number

	y: number

	add({ x, y }: Point2d): this {}

	equals({ x, y }: Point2d): boolean {}

	clone(): Point2d {}

	values(): [number, number] {}

	toString(): string {}
}
```

### `createRect2d`

Creates a `Rect2d` from the top left (`position`) and the bottom right (`end`) corner. You can use this function to represent 2D rectangles.

```ts
function createRect2d(position: Coordinates2d, end: Coordinates2d): Rect2d {}
```

```ts
class Rect2d {
	end: Point2d

	position: Point2d

	area: number

	width: number

	height: number

	top: number

	bottom: number

	left: number

	right: number

	constructor(
		end: Coordinates2d,
		position: Coordinates2d = new Point2d(0, 0),
	) {}

	getIntersection(rect: Rect2d): Rect2d | null {}

	getGap(rect: Rect2d, returnIntersection = false): Rect2d | null {}

	toString(): string {}
}
```

### `createVector2d`

Creates a `Vector2d` from the origin (`tail`) and destination (`head`) coordinates. You can use this function to represent 2D Vectors/Segments.

```ts
function createVector2d(tail: Coordinates2d, head: Coordinates2d): Vector2d {}
```

```ts
class Vector2d {
	head: Point2d

	tail: Point2d

	constructor(head: Coordinates2d, tail: Coordinates2d = new Point2d(0, 0)) {}

	translate(x: number, y: number): this {}

	perpendicularTranslate(length: number): this {}

	length(): number {}

	add({ head, tail }: Vector2d): this {}

	substract({ head, tail }: Vector2d): this {}

	equals({ head, tail }: Vector2d): boolean {}

	abs(): this {}

	normalize(): this {}

	scalarDivide(scalar: number): this {}

	scalarMultiply(scalar: number): this {}

	isPositionVector(): boolean {
		return this.tail.x === 0 && this.tail.y === 0
	}

	clone(): Vector2d {
		return Vector2d.fromCoordinates(
			this.head.x,
			this.head.y,
			this.tail.x,
			this.tail.y,
		)
	}

	toLine2d(): Line2d {}

	toString(): string {}
}
```

### `getDocumentSize`

`getDocumentSize` returns the current size of the document.

```ts
function getDocumentSize(): { width: number; height: number } {}
```

### `getBoundingDocumentRect`

`getBoundingDocumentRect` returns an element's `DOMRect` relative to the whole `Document` in contrast to the native `getBoundingClientRect` which returns the `DOMRect` relative to the current view.

```ts
function getBoundingDocumentRect(element: Element): DOMRect {}
```

## Contributors

<table>
	<tbody>
		<tr>
			<td align="center">
				<a href="https://github.com/Alexandre-Fernandez">
					<figure>
						<img src="https://avatars.githubusercontent.com/u/79476242?v=4?s=100" width="100px;"
							alt="Alexandre Fernandez">
						<br />
						<figcaption><sub>Alexandre Fernandez</sub></figcaption>
					</figure>
				</a>
			</td>
		</tr>
	</tbody>
</table>
