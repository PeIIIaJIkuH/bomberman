class Player {
	constructor() {
		this.left = 0
		this.top = 0
		this.step = 5
		this.keysPressed = {}
		this.init()
	}

	init = () => {
		this.root = document.getElementsByClassName('root')[0]
		this.div = document.createElement('div')
		this.div.classList.add('player')
		this.div.style.left = `${this.left}px`
		this.div.style.top = `${this.top}px`
		this.addEventListeners()
		this.root.append(this.div)
		this.animate()
	}

	addEventListeners = () => {
		document.addEventListener('keydown', e => {
			this.keysPressed[e.code] = true
		})
		document.addEventListener('keyup', e => {
			delete this.keysPressed[e.code]
		})
	}

	setLeft = val => {
		this.div.style.left = `${parseFloat(val)}px`
	}
	setTop = val => {
		this.div.style.top = `${parseFloat(val)}px`
	}

	updateLeft = val => {
		const left = parseFloat(this.div.style.left) + val
		this.setLeft(left)
	}
	updateTop = val => {
		const top = parseFloat(this.div.style.top) + val
		this.setTop(top)
	}

	animate = () => {
		const callback = () => {
			if (this.keysPressed['KeyD'])
				this.moveRight()
			if (this.keysPressed['KeyA'])
				this.moveLeft()
			if (this.keysPressed['KeyW'])
				this.moveUp()
			if (this.keysPressed['KeyS'])
				this.moveDown()
			requestAnimationFrame(callback)
		}
		requestAnimationFrame(callback)
	}

	moveLeft = () => {
		this.updateLeft(-this.step)
	}
	moveRight = () => {
		this.updateLeft(this.step)
	}
	moveUp = () => {
		this.updateTop(-this.step)
	}
	moveDown = () => {
		this.updateTop(this.step)
	}
}

const player = new Player()