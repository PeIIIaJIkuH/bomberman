class Bomberman {
	constructor(left = 0, top = 0, size = 32, step = 2, pixelSize = 2) {
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
		this.img.style.width = `${32 * 7 * this.pixelSize}px`
		this.img.style.height = `${32 * 4 * this.pixelSize}px`
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
		this.updateLeft(-Math.min(Math.abs(root - div + 1), this.step))
		this.removeClasses()
		this.img.classList.add('bomberman-walk-left')
		return 'left'
	}
	moveRight = (root, div) => {
		this.updateLeft(Math.min(Math.abs(root - div - 1), this.step))
		this.removeClasses()
		this.img.classList.add('bomberman-walk-right')
		return 'right'
	}
	moveUp = (root, div) => {
		this.updateTop(-Math.min(Math.abs(root - div + 1), this.step))
		this.removeClasses()
		this.img.classList.add('bomberman-walk-up')
		return 'up'
	}
	moveDown = (root, div) => {
		this.updateTop(Math.min(Math.abs(root - div - 1), this.step))
		this.removeClasses()
		this.img.classList.add('bomberman-walk-down')
		return 'down'
	}

	animate = () => {
		let direction
		const callback = () => {
			const root = this.root.getBoundingClientRect()
			const div = this.div.getBoundingClientRect()
			if (direction)
				this.addLookDirection(direction)
			if (this.keysPressed['KeyA'] && div.left > root.left)
				direction = this.moveLeft(root.left, div.left)
			if (this.keysPressed['KeyD'] && div.right < root.right)
				direction = this.moveRight(root.right, div.right)
			if (this.keysPressed['KeyW'] && div.top > root.top)
				direction = this.moveUp(root.top, div.top)
			if (this.keysPressed['KeyS'] && div.bottom < root.bottom)
				direction = this.moveDown(root.bottom, div.bottom)
			requestAnimationFrame(callback)
		}
		requestAnimationFrame(callback)
	}
}

const bomberman = new Bomberman()