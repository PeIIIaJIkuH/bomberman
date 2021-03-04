class Bomberman {
	constructor({left = 0, top = 0, size = 32, step = 1, pixelSize = 1} = {}) {
		this.left = left
		this.top = top
		this.size = size
		this.step = step
		this.pixelSize = pixelSize
		this.keysPressed = {}
		this.init()
	}

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

	createAnimationStyle = () => {
		const style = document.createElement('style')
		style.innerHTML = `
			.bomberman-walk-left {
    			animation: bomberman-walk-left ${1 / this.step}s steps(7) infinite;
			}
			.bomberman-walk-right {
    			animation: bomberman-walk-right ${1 / this.step}s steps(7) infinite;
			}
			.bomberman-walk-up {
    			animation: bomberman-walk-up ${1 / this.step}s steps(7) infinite;
			}
			.bomberman-walk-down {
    			animation: bomberman-walk-down ${1 / this.step}s steps(7) infinite;
			}`
		document.querySelector('head').append(style)
	}

	createHTML = () => {
		this.createAnimationStyle()
		this.root = document.querySelector('#root')
		this.div = document.querySelector('#bomberman')
		this.img = document.querySelector('#bomberman-sprite')
		this.div.style.left = `${this.left}px`
		this.div.style.top = `${this.top}px`
		this.div.style.width = `${this.size * this.pixelSize}px`
		this.div.style.height = `${this.size * this.pixelSize}px`
		this.img.style.width = `${this.size * 7 * this.pixelSize}px`
		this.img.style.height = `${this.size * 4 * this.pixelSize}px`
		this.img.classList.add('bomberman-look-down')
	}

	addEventListeners = () => {
		document.addEventListener('keydown', e => {
			this.keysPressed[e.code] = true
		})
		document.addEventListener('keyup', e => {
			delete this.keysPressed[e.code]
		})
	}

	removeClasses = () => {
		this.img.className = 'pixel-art'
	}

	addLookDirection = direction => {
		this.img.className = `pixel-art bomberman-look-${direction}`
	}

	moveLeft = (root, div) => {
		const min = Math.min(Math.abs(root - div + 1), this.step)
		if (min) {
			this.removeClasses()
			this.img.classList.add('bomberman-walk-left')
			this.updateLeft(-min)
		}
		return ['left', true]
	}
	moveRight = (root, div) => {
		const min = Math.min(Math.abs(root - div - 1), this.step)
		if (min) {
			this.removeClasses()
			this.img.classList.add('bomberman-walk-right')
			this.updateLeft(min)
		}
		return ['right', true]
	}
	moveUp = (root, div) => {
		const min = Math.min(Math.abs(root - div + 1), this.step)
		if (min) {
			this.removeClasses()
			this.img.classList.add('bomberman-walk-up')
			this.updateTop(-min)
		}
		return ['up', true]
	}
	moveDown = (root, div) => {
		const min = Math.min(Math.abs(root - div - 1), this.step)
		if (min) {
			this.removeClasses()
			this.img.classList.add('bomberman-walk-down')
			this.updateTop(min)
		}
		return ['down', true]
	}

	animate = () => {
		let direction = 'down'
		const callback = () => {
			let isMoving = false
			const root = this.root.getBoundingClientRect()
			const div = this.div.getBoundingClientRect()
			if (this.keysPressed['KeyA'] && div.left > root.left)
				[direction, isMoving] = this.moveLeft(root.left, div.left)
			if (this.keysPressed['KeyD'] && div.right < root.right)
				[direction, isMoving] = this.moveRight(root.right, div.right)
			if (this.keysPressed['KeyW'] && div.top > root.top)
				[direction, isMoving] = this.moveUp(root.top, div.top)
			if (this.keysPressed['KeyS'] && div.bottom < root.bottom)
				[direction, isMoving] = this.moveDown(root.bottom, div.bottom)
			if (!isMoving) {
				setTimeout(() => {
					this.addLookDirection(direction)
				}, 50)
			}
			requestAnimationFrame(callback)
		}
		requestAnimationFrame(callback)
	}
}

new Bomberman({
	size: 50,
	pixelSize: 1,
	step: 2
})