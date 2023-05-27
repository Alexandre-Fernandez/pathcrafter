import { GIT_REPO } from "@src/constants"

class UnexpectedError extends Error {
	constructor(info?: string) {
		super(
			info
				? `Unexpected error ("${info}"), please open an issue on the git repository: "${GIT_REPO}".`
				: `Unexpected error, please open an issue on the git repository: "${GIT_REPO}".`,
		)
	}
}

export default UnexpectedError
