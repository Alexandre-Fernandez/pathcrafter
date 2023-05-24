import { PACKAGE_NAME } from "@src/constants"

export const classes = {
	container: `_${PACKAGE_NAME}`,
}

export default `
.${classes.container} {
	position: absolute;
	pointer-events: none;
	top: 0;
	left: 0;
}
`
