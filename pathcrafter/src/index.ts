export function testFn(): void {
	const typedVariable: any = "it works or not"
	console.log(typedVariable)
}
// currently main is set to this file, old:
// "main": dist/src/index.mjs
/*
	"main": "./src/index.ts",
	"types": "./src/index.ts",
*/
