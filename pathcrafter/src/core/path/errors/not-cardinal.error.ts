class NotCardinal extends Error {
	constructor(subject = "") {
		super(
			subject
				? `Only cardinal directions can be used (top, bottom, right or left), "${subject}" given.`
				: "Only cardinal directions can be used (top, bottom, right or left).",
		)
	}
}

export default NotCardinal
