import { getBoundingDocumentRect } from "@lib/dom"
import { isCoordinate2d } from "@lib/geometry/2d/guards"
import Point2d from "@lib/geometry/2d/classes/point2d.class"
import Rect2d from "@lib/geometry/2d/classes/rect2d.class"
import Vector2d from "@lib/geometry/2d/classes/vector2d.class"
import UnexpectedError from "@src/errors/unexpected-error.error"
import ElementNotFound from "@src/core/measuring/errors/element-not-found.error"
import { Direction, SelectorElement } from "@src/core/measuring/types"
import type { Coordinates2d } from "@lib/geometry/2d/types"

export function createPoint2d(x: number, y: number) {
	return new Point2d(x, y)
}

export function createRect2d(position: Coordinates2d, end: Coordinates2d) {
	return new Rect2d(end, position)
}

export function createVector2d(tail: Coordinates2d, head: Coordinates2d) {
	return new Vector2d(head, tail)
}

export function getElementRect(element1: SelectorElement) {
	return Rect2d.fromDomRect(
		getBoundingDocumentRect(selectorToElement(element1)),
	)
}

export function getElementEdgePoint(
	element: SelectorElement,
	edge: Direction,
	percentage: number,
) {
	const el = selectorToElement(element)
	const pct = percentage * 0.01

	const { top, bottom, right, left, width, height } =
		getBoundingDocumentRect(el)

	switch (edge) {
		case "top": {
			return new Point2d(left + width * pct, top)
		}
		case "bottom": {
			return new Point2d(left + width * pct, bottom)
		}
		case "right": {
			return new Point2d(right, top + height * pct)
		}
		case "left": {
			return new Point2d(left, top + height * pct)
		}
		default: {
			throw new UnexpectedError("Unknown direction")
		}
	}
}

export function getDistance<T extends number | Coordinates2d>(
	position: T,
	destination: T,
): T extends number ? number : Coordinates2d {
	if (typeof position === "number" && typeof destination === "number") {
		return (destination - position) as any
	}
	if (isCoordinate2d(position) && isCoordinate2d(destination)) {
		return {
			x: destination.x - position.x,
			y: destination.y - position.y,
		} as any
	}
	throw new TypeError(
		"`distance` and `position` must be either a number or a Coordinates2d.",
	)
}

export function getGapRect(
	element1: SelectorElement,
	element2: SelectorElement,
) {
	const rect1 = Rect2d.fromDomRect(
		getBoundingDocumentRect(selectorToElement(element1)),
	)
	const rect2 = Rect2d.fromDomRect(
		getBoundingDocumentRect(selectorToElement(element2)),
	)
	return rect1.getGap(rect2, false)
}

export function getGapX(
	element1: SelectorElement,
	element2: SelectorElement,
	percentage = 100,
) {
	const gap = getGapRect(element1, element2)
	const pct = percentage * 0.01
	return gap ? gap.width * pct : 0
}

export function getGapY(
	element1: SelectorElement,
	element2: SelectorElement,
	percentage = 100,
) {
	const gap = getGapRect(element1, element2)
	const pct = percentage * 0.01
	return gap ? gap.height * pct : 0
}

function selectorToElement(selectorElement: SelectorElement) {
	const element =
		typeof selectorElement === "string"
			? document.querySelector(selectorElement)
			: selectorElement

	if (!element) throw new ElementNotFound(`${selectorElement}`)

	return element
}
