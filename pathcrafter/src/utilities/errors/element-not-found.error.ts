class ElementNotFound extends Error {
	constructor(selector?: string) {
		super(
			selector
				? `Unable to find element "${selector}".`
				: "Unable to find element.",
		)
	}
}

export default ElementNotFound
