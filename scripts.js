class Bomberman {
	constructor({left = 0, top = 0, size = 32, step = 1, pixelSize = 1, direction = 'down'} = {}) {
		this.left = left
		this.top = top
		this.size = size
		this.step = step
		this.direction = direction
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
			this.img.className = 'pixel-art bomberman-walk-left'
			this.updateLeft(-min)
			this.direction = 'left'
			return true
		}
		return false
	}
	moveRight = (root, div) => {
		const min = Math.min(Math.abs(root - div - 1), this.step)
		if (min) {
			this.img.className = 'pixel-art bomberman-walk-right'
			this.updateLeft(min)
			this.direction = 'right'
			return true
		}
		return false
	}
	moveUp = (root, div) => {
		const min = Math.min(Math.abs(root - div + 1), this.step)
		if (min) {
			this.img.className = 'pixel-art bomberman-walk-up'
			this.updateTop(-min)
			this.direction = 'up'
			return true
		}
		return false
	}
	moveDown = (root, div) => {
		const min = Math.min(Math.abs(root - div - 1), this.step)
		if (min) {
			this.img.className = 'pixel-art bomberman-walk-down'
			this.updateTop(min)
			this.direction = 'down'
			return true
		}
		return false
	}

	animate = () => {
		const callback = () => {
			const root = this.root.getBoundingClientRect()
			const div = this.div.getBoundingClientRect()
			let isMovingLeft, isMovingRight, isMovingUp, isMovingDown
			if (this.keysPressed['KeyA'] && !this.keysPressed['KeyD'] && div.left > root.left)
				isMovingLeft = this.moveLeft(root.left, div.left)
			if (this.keysPressed['KeyD'] && !this.keysPressed['KeyA'] && div.right < root.right)
				isMovingRight = this.moveRight(root.right, div.right)
			if (this.keysPressed['KeyW'] && !this.keysPressed['KeyS'] && div.top > root.top)
				isMovingUp = this.moveUp(root.top, div.top)
			if (this.keysPressed['KeyS'] && !this.keysPressed['KeyW'] && div.bottom < root.bottom)
				isMovingDown = this.moveDown(root.bottom, div.bottom)
			let isMoving = isMovingLeft || isMovingRight || isMovingUp || isMovingDown
			console.log(isMovingLeft, isMovingRight, isMovingUp, isMovingDown, this.direction)
			if (!isMoving)
				setTimeout(() => this.addLookDirection(this.direction), 50)
			requestAnimationFrame(callback)
		}
		requestAnimationFrame(callback)
	}
}

new Bomberman({
	size: 50,
	pixelSize: 2,
	step: 3
})