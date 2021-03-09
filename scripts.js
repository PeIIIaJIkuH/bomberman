const getRandomInt = (min, max) => {
	min = Math.ceil(min)
	max = Math.ceil(max)
	return Math.floor(Math.random() * (max - min)) + min
}

class Block {
	constructor({x = 1, y = 1, board} = {}) {
		this.x = x
		this.y = y
		this.board = board

		this.initialize()
	}

	createHTML = () => {
		this.div = document.createElement('div')
		this.div.style.gridColumnStart = String(this.x)
		this.div.style.gridRowStart = String(this.y)
		this.board.append(this.div)
	}

	initialize = () => {
		this.createHTML()
	}
}

class Rock extends Block {
	constructor({x = 1, y = 1, board} = {}) {
		super({x, y, board})
		this.initialize()
	}

	initialize = () => {
		this.createHTML()
	}

	createHTML = () => {
		this.div.classList.add('pixel-art', 'rock')
	}
}

class Wall extends Block {
	constructor({x = 1, y = 1, board} = {}) {
		super({x, y, board})
		this.initialize()
	}

	initialize = () => {
		this.createHTML()
	}

	createHTML = () => {
		this.div.classList.add('pixel-art', 'wall')
		this.img = document.createElement('img')
		this.img.src = './img/wall.png'
		this.img.style.height = '100%'
		this.img.style.objectFit = 'contain'
		this.div.append(this.img)
	}
}

class Entity {
	constructor({board, pixelSize = 1} = {}) {
		this.board = board
		this.pixelSize = pixelSize
		this.speed = 1
		this.left = pixelSize * 2
		this.top = pixelSize * 2
		this.size = 16 * pixelSize * 0.75

		this.initialize()
		this.draw()
	}

	createHTML = () => {
		this.div = document.createElement('div')
		this.div.classList.add('pixel-art')
		this.img = document.createElement('img')
		this.div.append(this.img)
		this.board.append(this.div)
	}

	moveLeft() {
		this.left -= this.speed
	}

	moveRight() {
		this.left += this.speed
	}

	moveUp() {
		this.top -= this.speed
	}

	moveDown() {
		this.top += this.speed
	}

	draw = () => {
		this.div.style.position = 'absolute'
		this.div.style.left = `${16 * this.pixelSize + this.left}px`
		this.div.style.top = `${16 * this.pixelSize + this.top}px`
		this.div.style.height = `${this.size}px`
		this.div.style.width = `${this.size}px`

	}

	initialize = () => {
		this.createHTML()
	}
}

class Bomberman extends Entity {
	constructor({board, pixelSize = 1} = {}) {
		super({board, pixelSize})
		this.direction = 'down'

		this.initialize()
	}

	createHTML = () => {
		this.div.id = 'bomberman'
		this.img.src = './img/bomberman.png'
	}

	moveLeft() {
		super.moveLeft()
		this.img.className = 'pixel-art bomberman-walk-left'
		this.direction = 'left'
	}

	moveRight() {
		super.moveRight()
		this.img.className = 'pixel-art bomberman-walk-right'
		this.direction = 'right'
	}

	moveUp() {
		super.moveUp()
		this.img.className = 'pixel-art bomberman-walk-up'
		this.direction = 'up'
	}

	moveDown() {
		super.moveDown()
		this.img.className = 'pixel-art bomberman-walk-down'
		this.direction = 'down'
	}

	initialize = () => {
		this.createHTML()
	}
}

class Game {
	constructor({rows = 13, columns = 31, pixelSize = 1} = {}) {
		this.rows = rows
		this.columns = columns
		this.pixelSize = pixelSize
		this.keysPressed = {}
		this.board = document.querySelector('#board')
		this.rocks = []
		this.walls = []
		this.bomberman = new Bomberman({board: this.board, pixelSize: this.pixelSize})

		this.initialize()
	}

	initialize = () => {
		this.createHTML()
		this.createCSS()
		this.addEventListeners()

		this.animate()
	}

	createRocks = () => {
		for (let i = 1; i <= this.columns; i++) {
			this.rocks.push(new Rock({x: i, y: 1, board: this.board}))
			this.rocks.push(new Rock({x: i, y: this.rows, board: this.board}))
		}
		for (let i = 2; i < this.rows; i++) {
			this.rocks.push(new Rock({x: 1, y: i, board: this.board}))
			this.rocks.push(new Rock({x: this.columns, y: i, board: this.board}))
		}
		for (let i = 3; i < this.columns; i += 2)
			for (let j = 3; j < this.rows; j += 2)
				this.rocks.push(new Rock({x: i, y: j, board: this.board}))
	}

	isBlock = (x, y) => {
		x = Math.floor(x)
		y = Math.floor(y)
		return this.rocks.some(rock => rock.x === x && rock.y === y) || this.walls.some(wall => wall.x === x && wall.y === y)
	}

	createWalls = () => {
		const count = Math.round(this.rows * this.columns / 8)
		const wallsCount = getRandomInt(count * 0.9, count * 1.1)
		let sum = 0
		while (sum < wallsCount) {
			const x = getRandomInt(1, this.columns),
				y = getRandomInt(1, this.rows)
			if (!this.isBlock(x, y) && !(x <= 4 && y <= 4)) {
				this.walls.push(new Wall({x, y, board: this.board}))
				sum++
			}
		}
	}

	createHTML = () => {
		this.createRocks()
		this.createWalls()
	}

	createCSS = () => {
		const style = document.createElement('style')
		style.innerHTML = `
			#board {
				grid-template-rows: repeat(${this.rows}, ${16 * this.pixelSize}px);
				grid-template-columns: repeat(${this.columns}, ${16 * this.pixelSize}px);
			}`
		document.querySelector('head').append(style)
		this.updateSizes()
	}

	updateSizes = () => {
		this.board.style.width = `${16 * this.columns * this.pixelSize}px`
		this.board.style.height = `${16 * this.rows * this.pixelSize}px`
	}

	addEventListeners = () => {
		document.addEventListener('keydown', e => {
			this.keysPressed[e.code] = true
		})
		document.addEventListener('keyup', e => {
			delete this.keysPressed[e.code]
		})
	}

	draw = () => {
		this.bomberman.draw()
	}

	update = () => {
		const left = (this.bomberman.left - 1) / (this.pixelSize * 16) + 2,
			right = (this.bomberman.left + this.bomberman.size) / (this.pixelSize * 16) + 2,
			top = (this.bomberman.top - 1) / (this.pixelSize * 16) + 2,
			bottom = (this.bomberman.top + this.bomberman.size) / (this.pixelSize * 16) + 2
		let moved = false
		if (this.keysPressed['KeyA'] && !this.keysPressed['KeyD']) {
			if (!this.isBlock(left, top + 0.05) && !this.isBlock(left, bottom - 0.05)) {
				this.bomberman.moveLeft()
				moved = true
			}
		}
		if (this.keysPressed['KeyD'] && !this.keysPressed['KeyA']) {
			if (!this.isBlock(right, top + 0.05) && !this.isBlock(right, bottom - 0.05)) {
				this.bomberman.moveRight()
				moved = true
			}
		}
		if (this.keysPressed['KeyW'] && !this.keysPressed['KeyS']) {
			if (!this.isBlock(left + 0.05, top) && !this.isBlock(right - 0.05, top)) {
				this.bomberman.moveUp()
				moved = true
			}
		}
		if (this.keysPressed['KeyS'] && !this.keysPressed['KeyW']) {
			if (!this.isBlock(left + 0.05, bottom) && !this.isBlock(right - 0.05, bottom)) {
				this.bomberman.moveDown()
				moved = true
			}
		}
		if (!moved) this.bomberman.img.className = `pixel-art bomberman-look-${this.bomberman.direction}`
	}

	animate = () => {
		const callback = () => {
			requestAnimationFrame(callback)

			this.update()
			this.draw()
		}
		requestAnimationFrame(callback)
	}
}

new Game({
	pixelSize: 3
})