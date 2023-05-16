class Vector2 {
	static get TOP() {
		return new Vector2(0, -1)
	}

	static get RIGHT() {
		return new Vector2(1, 0)
	}

	static get BOTTOM() {
		return new Vector2(0, 1)
	}

	static get LEFT() {
		return new Vector2(-1, 0)
	}

	static get TOP_RIGHT() {
		return new Vector2(1, -1)
	}

	static get TOP_LEFT() {
		return new Vector2(-1, -1)
	}

	static get BOTTOM_RIGHT() {
		return new Vector2(1, 1)
	}

	static get BOTTOM_LEFT() {
		return new Vector2(-1, 1)
	}

	constructor(public x: number, public y: number) {}

	magnitude() {
		return Math.sqrt(this.x * this.x + this.y * this.y)
	}

	add({ x, y }: Vector2) {
		this.x += x
		this.y += y
		return this
	}

	substract({ x, y }: Vector2) {
		this.x -= x
		this.y -= y
		return this
	}

	equals({ x, y }: Vector2) {
		return this.x === x && this.y === y
	}

	abs() {
		this.x = Math.abs(this.x)
		this.y = Math.abs(this.y)
		return this
	}

	normalize() {
		const currentMagnitude = this.magnitude()
		this.x /= currentMagnitude
		this.y /= currentMagnitude
		return this
	}

	clone() {
		return new Vector2(this.x, this.y)
	}
}

export default Vector2
