class EmptyMovements extends Error {
	constructor() {
		super("No movements have been defined for this path.")
	}
}

export default EmptyMovements
