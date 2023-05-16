class ZeroDivision extends Error {
	constructor(subject = "") {
		super(
			subject
				? `Can not divide "${subject}" by 0.`
				: "Can not divide by 0.",
		)
	}
}

export default ZeroDivision
