const getRandomInt = (min, max) => {
	min = Math.ceil(min)
	max = Math.ceil(max)
	return Math.floor(Math.random() * (max - min)) + min
}

class Entity {
	constructor({left: x = 2, top: y = 2, speed = 1, board, rows = 13, columns = 31} = {}) {
		this.x = x
		this.y = y
		this.speed = speed
		this.board = board
		this.rows = rows
		this.columns = columns

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
		this.x -= this.speed
	}

	moveRight() {
		this.x += this.speed
	}

	moveUp() {
		this.y -= this.speed
	}

	moveDown() {
		this.y += this.speed
	}

	draw = () => {
		// this.div.style.left = `calc(${1 / this.columns * 100}% + ${this.left}px)`
		// this.div.style.top = `calc(${1 / this.rows * 100}% + ${this.top}px)`
		this.div.style.gridRowStart = String(this.y)
		this.div.style.gridColumnStart = String(this.x)

	}

	initialize = () => {
		this.createHTML()
	}
}

class Bomberman extends Entity {
	constructor({left = 2, top = 2, speed = 1, board, rows = 13, columns = 31} = {}) {
		super({left, top, speed, board, rows, columns})
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
		this.div.append(this.img)
	}
}

class Game {
	constructor({rows = 13, columns = 31} = {}) {
		this.rows = rows
		this.columns = columns
		this.keysPressed = {}
		this.board = document.querySelector('#board')
		this.rocks = []
		this.walls = []
		this.bomberman = new Bomberman({board: this.board})

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
				grid-template-rows: repeat(${this.rows}, 1fr);
				grid-template-columns: repeat(${this.columns}, 1fr);
			}`
		document.querySelector('head').append(style)
		this.updateSizes()
	}

	updateSizes = () => {
		const body = document.querySelector('body').getBoundingClientRect()
		const wRatio = body.width / this.columns,
			hRatio = body.height / this.rows
		const max = Math.max(wRatio, hRatio)
		this.board.style.width = `${hRatio / max * 100}%`
		this.board.style.height = `${wRatio / max * 100}%`
	}

	addEventListeners = () => {
		document.addEventListener('keydown', e => {
			this.keysPressed[e.code] = true
		})
		document.addEventListener('keyup', e => {
			delete this.keysPressed[e.code]
		})
		window.addEventListener('resize', () => {
			this.updateSizes()
		})
	}

	draw = () => {
		this.bomberman.draw()
	}

	animate = () => {
		let prevTime = 0
		const callback = (currTime) => {
			requestAnimationFrame(callback)
			if ((currTime - prevTime) / 1000 < 1 / 60)
				return
			prevTime = currTime
			let moved = false
			if (this.keysPressed['KeyA'] && !this.keysPressed['KeyD'] && !this.isBlock(this.bomberman.x - 1, this.bomberman.y)) {
				this.bomberman.moveLeft()
				moved = true
			}
			if (this.keysPressed['KeyD'] && !this.keysPressed['KeyA'] && !this.isBlock(this.bomberman.x + 1, this.bomberman.y)) {
				this.bomberman.moveRight()
				moved = true
			}
			if (this.keysPressed['KeyW'] && !this.keysPressed['KeyS'] && !this.isBlock(this.bomberman.x, this.bomberman.y - 1)) {
				this.bomberman.moveUp()
				moved = true
			}
			if (this.keysPressed['KeyS'] && !this.keysPressed['KeyW'] && !this.isBlock(this.bomberman.x, this.bomberman.y + 1)) {
				this.bomberman.moveDown()
				moved = true
			}
			if (!moved)
				this.bomberman.img.className = `pixel-art bomberman-look-${this.bomberman.direction}`

			this.draw()
		}
		requestAnimationFrame(callback)
	}
}

const game = new Game()