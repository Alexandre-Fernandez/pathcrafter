import { getBoundingDocumentRect } from "@lib/dom"
import Point2d from "@lib/geometry/2d/classes/point2d.class"
import Rect2d from "@lib/geometry/2d/classes/rect2d.class"
import ElementNotFound from "@src/core/tools/errors/element-not-found.error"
import UnexpectedError from "@src/errors/unexpected-error.error"
import { Direction, SelectorElement } from "@src/core/tools/types"

class Tools {
	static point(x: number, y: number) {
		return new Point2d(x, y)
	}

	static edgePoint(
		element: SelectorElement,
		edge: Direction,
		percentage: number,
	) {
		const el = this.#selectorToElement(element)
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

	static elRect(element1: SelectorElement) {
		return Rect2d.fromDomRect(
			getBoundingDocumentRect(this.#selectorToElement(element1)),
		)
	}

	// TODO rework gap so it returns negative numbers on intersection
	static gapRect(
		element1: SelectorElement,
		element2: SelectorElement,
		returnIntersection = true,
	) {
		const rect1 = Rect2d.fromDomRect(
			getBoundingDocumentRect(this.#selectorToElement(element1)),
		)
		const rect2 = Rect2d.fromDomRect(
			getBoundingDocumentRect(this.#selectorToElement(element2)),
		)
		return rect1.getGap(rect2, returnIntersection)
	}

	static xGap(
		element1: SelectorElement,
		element2: SelectorElement,
		percentage = 100,
	) {
		const gap = this.getGap(element1, element2)
		const pct = percentage * 0.01
		return gap ? gap.width * pct : 0
	}

	static yGap(
		element1: SelectorElement,
		element2: SelectorElement,
		percentage = 100,
	) {
		const gap = this.getGap(element1, element2)
		const pct = percentage * 0.01
		return gap ? gap.height * pct : 0
	}

	static getGap(element1: SelectorElement, element2: SelectorElement) {
		const rect1 = Rect2d.fromDomRect(
			getBoundingDocumentRect(this.#selectorToElement(element1)),
		)
		const rect2 = Rect2d.fromDomRect(
			getBoundingDocumentRect(this.#selectorToElement(element2)),
		)
		return rect1.getGap(rect2, false)
	}

	static #selectorToElement(selectorElement: SelectorElement) {
		const element =
			typeof selectorElement === "string"
				? document.querySelector(selectorElement)
				: selectorElement

		if (!element) throw new ElementNotFound(`${selectorElement}`)

		return element
	}
}

export default Tools
