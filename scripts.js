class Player {
	constructor(left = 0, top = 0, size = 30, step = 5) {
		this.left = left
		this.top = top
		this.size = size
		this.step = step
		this.keysPressed = {}
		this.init()
	}

	getLeft = () => this.left
	getRight = () => this.left + this.size
	getTop = () => this.top
	getBottom = () => this.top + this.size

	setLeft = val => {
		this.left = parseFloat(val)
		this.div.style.left = `${this.left}px`
	}
	setTop = val => {
		this.top = parseFloat(val)
		this.div.style.top = `${this.top}px`
	}

	updateLeft = val => {
		const left = this.left + val
		this.setLeft(left)
	}
	updateTop = val => {
		const top = this.top + val
		this.setTop(top)
	}

	init = () => {
		this.createHTML()
		this.addEventListeners()
		this.animate()
	}

	createHTML = () => {
		this.root = document.querySelector('#root')
		this.div = document.createElement('div')
		this.div.classList.add('player')
		this.div.style.left = `${this.left}px`
		this.div.style.top = `${this.top}px`
		this.div.style.width = `${this.size}px`
		this.div.style.height = `${this.size}px`
		this.root.append(this.div)
	}

	addEventListeners = () => {
		document.addEventListener('keydown', e => {
			this.keysPressed[e.code] = true
		})
		document.addEventListener('keyup', e => {
			delete this.keysPressed[e.code]
		})
	}

	animate = () => {
		const callback = () => {
			const root = this.root.getBoundingClientRect()
			const div = this.div.getBoundingClientRect()
			if (this.keysPressed['KeyA'] && div.left > root.left + this.step)
				this.moveLeft()
			if (this.keysPressed['KeyD'] && div.right < root.right - this.step)
				this.moveRight()
			if (this.keysPressed['KeyW'] && div.top > root.top + this.step)
				this.moveUp()
			if (this.keysPressed['KeyS'] && div.bottom < root.bottom - this.step)
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