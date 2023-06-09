import { uid } from "@lib/string"
import { getDocumentSize } from "@lib/dom"
import { SVG_NAMESPACE } from "@src/constants"
import { classes } from "@src/styles"
import Path from "@src/core/path/classes/path.class"
import type { SvgOptions } from "@src/core/svg/types"

class Svg implements SvgOptions {
	strokeWidth: string | number

	#id: string

	#divEl = document.createElement("div")

	#svgEl = document.createElementNS(SVG_NAMESPACE, "svg")

	#paths

	constructor(paths: Path[] = [], options: Partial<SvgOptions> = {}) {
		this.#divEl.classList.add(classes.container)

		// adding paths to svg
		this.#paths = paths
		for (const path of this.#paths) {
			this.#svgEl.append(path.updateElement().getElement())
		}
		this.#clearCaches() // clear caches for next run

		// init options
		const { id, strokeWidth } = {
			...Svg.defaultOptions,
			...options,
		}
		this.#id = id
		this.strokeWidth = strokeWidth

		this.#updateSize()
		this.#updateAttributes()

		// dom
		this.#divEl.append(this.#svgEl)
		document.body.append(this.#divEl)
	}

	static get defaultOptions(): SvgOptions {
		return {
			id: `_${uid()}`,
			strokeWidth: 2,
		}
	}

	get id() {
		return this.#id
	}

	update() {
		return this.#updateSize()
			.#updatePaths()
			.#updateAttributes()
			.#clearCaches()
	}

	#updatePaths() {
		for (const path of this.#paths) {
			path.updateElement()
		}
		return this
	}

	#updateSize() {
		const { width, height } = getDocumentSize()
		this.#svgEl.setAttribute("width", `${width}`)
		this.#svgEl.setAttribute("height", `${height}`)

		const offset = Number(this.strokeWidth) * 0.5
		this.#svgEl.setAttribute(
			"viewBox",
			`-${offset} -${offset} ${width} ${height}`,
		)
		return this
	}

	#updateAttributes() {
		this.#svgEl.setAttribute("stroke-width", `${this.strokeWidth}`)
		return this
	}

	#clearCaches() {
		for (const path of this.#paths) {
			path.clearCache()
		}
		return this
	}
}

export default Svg
