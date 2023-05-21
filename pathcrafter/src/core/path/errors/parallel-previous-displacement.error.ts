class ParallelPreviousDisplacement extends Error {
	constructor() {
		super(
			"Cannot get parallel displacement for this vector if the previous one is undefined.",
		)
	}
}

export default ParallelPreviousDisplacement
