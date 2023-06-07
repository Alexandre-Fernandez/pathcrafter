import { Coordinates2d } from "@src"

export function isCoordinate2d(
	coordinate2d: unknown,
): coordinate2d is Coordinates2d {
	if (!coordinate2d) return false
	if (typeof coordinate2d !== "object") return false
	return (
		typeof (coordinate2d as Record<string, unknown>)["x"] === "number" &&
		typeof (coordinate2d as Record<string, unknown>)["y"] === "number"
	)
}
