class MarkerNotFound extends Error {
	constructor(marker: string) {
		super(`No marker "${marker}" was found.`)
	}
}

export default MarkerNotFound
