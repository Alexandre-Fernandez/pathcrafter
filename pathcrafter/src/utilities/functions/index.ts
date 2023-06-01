import { getBoundingDocumentRect } from "@lib/dom"
import { Coordinates2d } from "@lib/geometry/2d/types"
import Point2d from "@lib/geometry/2d/point2d.class"
import Rect2d from "@lib/geometry/2d/rect2d.class"
import UnexpectedError from "@src/errors/unexpected-error.error"
import ElementNotFound from "@src/utilities/errors/element-not-found.error"
import { Direction, SelectorElement } from "@src/utilities/types"

export function xY(x: number, y: number) {
	return {
		x,
		y,
		toPoint2d() {
			return new Point2d(this.x, this.y)
		},
	} as Coordinates2d & { toPoint2d: () => Point2d }
}

export function edgePoint(
	element: SelectorElement,
	direction: Direction,
	percentage: number,
) {
	const el = selectorToElement(element)
	const pct = percentage * 0.01

	const { top, bottom, right, left, width, height } =
		getBoundingDocumentRect(el)

	switch (direction) {
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

export function gapRect(element1: SelectorElement, element2: SelectorElement) {
	const rect1 = Rect2d.fromDomRect(
		getBoundingDocumentRect(selectorToElement(element1)),
	)
	const rect2 = Rect2d.fromDomRect(
		getBoundingDocumentRect(selectorToElement(element2)),
	)

	return rect1.getGap(rect2)
}

export function xGap(
	element1: SelectorElement,
	element2: SelectorElement,
	percentage = 100,
) {
	const gap = getGap(element1, element2)
	const pct = percentage * 0.01

	return gap ? gap.width * pct : 0
}

export function yGap(
	element1: SelectorElement,
	element2: SelectorElement,
	percentage = 100,
) {
	const gap = getGap(element1, element2)
	const pct = percentage * 0.01

	return gap ? gap.height * pct : 0
}

function getGap(element1: SelectorElement, element2: SelectorElement) {
	const rect1 = Rect2d.fromDomRect(
		getBoundingDocumentRect(selectorToElement(element1)),
	)
	const rect2 = Rect2d.fromDomRect(
		getBoundingDocumentRect(selectorToElement(element2)),
	)
	return rect1.getGap(rect2, false)
}

function selectorToElement(selectorElement: SelectorElement) {
	const element =
		typeof selectorElement === "string"
			? document.querySelector(selectorElement)
			: selectorElement

	if (!element) throw new ElementNotFound(`${selectorElement}`)

	return element
}
