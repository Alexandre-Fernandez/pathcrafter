import { PACKAGE_NAME } from "@src/constants"
import styles from "@src/styles"

class Styles {
	static attributes = {
		data: `data-${PACKAGE_NAME}`,
	} as const

	static init() {
		if (!document.head.querySelector(`[${Styles.attributes.data}]`)) {
			const style = document.createElement("style")
			style.setAttribute(Styles.attributes.data, "")
			style.textContent = styles
			document.head.append(style)
		}
	}
}

export default Styles
