import { getDocumentSize } from "@lib/dom"
import { PACKAGE_NAME, SVG_NAMESPACE } from "@src/constants"
import Styles from "@src/core/global/styles.class"

class Svg {
	#divEl = document.createElement("div")

	#svgEl = document.createElementNS(SVG_NAMESPACE, "svg")

	constructor() {
		Styles.init()

		this.#divEl.classList.add(PACKAGE_NAME)

		const { width, height } = getDocumentSize()
		this.#svgEl.setAttribute("width", `${width}`)
		this.#svgEl.setAttribute("height", `${height}`)
		this.#divEl.append(this.#svgEl)

		document.body.append(this.#divEl)
	}
}

export default Svg
