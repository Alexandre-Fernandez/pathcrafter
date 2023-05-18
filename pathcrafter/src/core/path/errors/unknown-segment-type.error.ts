import SegmentType from "@src/core/path/enums/segment-type.enum"

class UnknownSegmentType extends Error {
	constructor(value?: string) {
		const segmentTypes = JSON.stringify(SegmentType)
		super(
			value
				? `Invalid segment type ("${value}"), valid types are "${segmentTypes}".`
				: `Invalid segment type, valid types are "${segmentTypes}".`,
		)
	}
}

export default UnknownSegmentType
