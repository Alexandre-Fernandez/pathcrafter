class NullDestination extends Error {
	constructor(destinationCategory?: string) {
		super(
			destinationCategory
				? `Destionation (${destinationCategory}) is null.`
				: "Destination is null.",
		)
	}
}

export default NullDestination
