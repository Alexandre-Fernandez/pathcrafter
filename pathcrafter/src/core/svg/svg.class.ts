import { getDocumentSize } from "@lib/dom"
import { SVG_NAMESPACE } from "@src/constants"
import { SvgOptions } from "@src/core/svg/types"
import { classes } from "@src/styles"
import Styles from "@src/core/global/styles.class"
import Path from "@src/core/path/classes/path.class"

class Svg implements SvgOptions {
	fill = "none"

	stroke = "black"

	strokeWidth: string | number = 2

	#divEl = document.createElement("div")

	#svgEl = document.createElementNS(SVG_NAMESPACE, "svg")

	#paths

	constructor(paths: Path[] = []) {
		Styles.init()
		this.#divEl.classList.add(classes.container)

		this.#paths = paths
		for (const path of this.#paths) {
			const pathEl = path.updateElement()
			this.#svgEl.append(pathEl)
		}

		this.#updateAttributes()
		this.#divEl.append(this.#svgEl)
		document.body.append(this.#divEl)
	}

	#updateAttributes() {
		const { width, height } = getDocumentSize()
		this.#svgEl.setAttribute("width", `${width}`)
		this.#svgEl.setAttribute("height", `${height}`)

		this.#svgEl.setAttribute("fill", this.fill)
		this.#svgEl.setAttribute("stroke", this.stroke)
		this.#svgEl.setAttribute("stroke-width", `${this.strokeWidth}`)

		const offset = Number(this.strokeWidth) * 0.5
		this.#svgEl.setAttribute(
			"viewBox",
			`-${offset} -${offset} ${width} ${height}`,
		)
	}
}

export default Svg
