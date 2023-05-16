export function getBoundingDocumentRect(element: Element) {
	const box = element.getBoundingClientRect()

	const scrollX =
		window.scrollX ||
		document.documentElement.scrollLeft ||
		document.body.scrollLeft
	const scrollY =
		window.scrollY ||
		document.documentElement.scrollTop ||
		document.body.scrollTop

	const borderX =
		document.documentElement.clientLeft || document.body.clientLeft || 0
	const borderY =
		document.documentElement.clientTop || document.body.clientTop || 0

	const x = Math.round(box.x + scrollX - borderX)
	const y = Math.round(box.y + scrollY - borderY)

	return {
		x,
		y,
		left: x,
		top: y,
		right: x + box.width,
		bottom: y + box.height,
		width: box.width,
		height: box.height,
	} satisfies Omit<DOMRect, "toJSON">
}