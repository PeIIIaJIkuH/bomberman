export class KeyListener {
	constructor() {
		this.keysPressed = new Map()

		this.initialize()
	}

	initialize = () => {
		document.addEventListener('keydown', e => {
			this.keysPressed.set(e.code, true)
		})
		document.addEventListener('keyup', e => {
			this.keysPressed.set(e.code, false)
		})
	}

	isPressed = code => this.keysPressed.get(code)
}