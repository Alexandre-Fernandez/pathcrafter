class PathStarted extends Error {
	constructor() {
		super("This path has already started.")
	}
}

export default PathStarted
