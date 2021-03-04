class Player {
	constructor(left = 0, top = 0, size = 30, step = 2) {
		this.left = left
		this.top = top
		this.size = size
		this.step = step
		this.keysPressed = {}
		this.init()
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

	init = () => {
		this.createHTML()
		this.addEventListeners()
		this.animate()
	}

	createHTML = () => {
		this.root = document.querySelector('.root')
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