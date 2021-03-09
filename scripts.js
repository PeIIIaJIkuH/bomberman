const getRandomInt = (min, max) => {
	min = Math.ceil(min)
	max = Math.ceil(max)
	return Math.floor(Math.random() * (max - min)) + min
}

const getRandomDirection = (directions = ['left', 'right', 'up', 'down']) => {
	return directions[getRandomInt(0, directions.length)]
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
	constructor({board, pixelSize = 1, left, top, speed = 1} = {}) {
		this.board = board
		this.pixelSize = pixelSize
		this.speed = speed || Math.floor(pixelSize / 2)
		this.left = left || pixelSize * 2
		this.top = top || pixelSize * 2
		this.size = 16 * pixelSize * 0.75

		this.initialize()
		this.draw()
	}

	createHTML = () => {
		this.div = document.createElement('div')
		this.div.classList.add('pixel-art')
		this.div.style.position = 'absolute'
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

class Enemy extends Entity {
	constructor({board, pixelSize = 1, left, top} = {}) {
		super({board, pixelSize, left, top})
		this.speed /= 2
		this.direction = getRandomDirection()

		this.initialize()
	}

	createHTML = () => {
		this.div.className = 'enemy pixel-art'
		this.img.src = './img/enemy.png'
	}

	moveLeft() {
		super.moveLeft()
		this.img.className = 'pixel-art enemy-walk-left'
		this.direction = 'left'
	}

	moveRight() {
		super.moveRight()
		this.img.className = 'pixel-art enemy-walk-right'
		this.direction = 'right'
	}

	moveUp() {
		super.moveUp()
		this.img.className = 'pixel-art enemy-walk-up'
		this.direction = 'up'
	}

	moveDown() {
		super.moveDown()
		this.img.className = 'pixel-art enemy-walk-down'
		this.direction = 'down'
	}

	die() {
		this.img.className = 'pixel-art enemy-die'
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

	die() {
		this.img.className = 'pixel-art bomberman-die'
		setTimeout(() => {
			this.img.className = 'pixel-art bomberman-dead'
		}, 700)
	}

	initialize = () => {
		this.createHTML()
	}
}

class Game {
	constructor({rows = 13, columns = 31, pixelSize = 1, enemyCount = 5} = {}) {
		this.rows = rows
		this.columns = columns
		this.pixelSize = pixelSize
		this.keysPressed = {}
		this.board = document.querySelector('#board')
		this.size = 16 * this.pixelSize
		this.enemyCount = enemyCount
		this.rocks = []
		this.walls = []
		this.bomberman = new Bomberman({board: this.board, pixelSize: this.pixelSize})
		this.enemies = []
		this.over = false

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
			if (!this.isBlock(x, y) && !(x <= 3 && y <= 3)) {
				this.walls.push(new Wall({x, y, board: this.board}))
				sum++
			}
		}
	}

	createEnemies = () => {
		let sum = 0
		while (sum < this.enemyCount) {
			const x = getRandomInt(1, this.columns),
				y = getRandomInt(1, this.rows)
			if (!this.isBlock(x, y) && !(x <= 5 && y <= 5)) {
				const left = this.size * (x - 2) + (2 * this.pixelSize),
					top = this.size * (y - 2) + (2 * this.pixelSize)
				this.enemies.push(new Enemy({left, top, board: this.board, pixelSize: this.pixelSize}))
				sum++
			}
		}
	}

	createHTML = () => {
		this.createRocks()
		this.createWalls()
		this.createEnemies()
	}

	createCSS = () => {
		const style = document.createElement('style')
		style.innerHTML = `
			#board {
				grid-template-rows: repeat(${this.rows}, ${this.size}px);
				grid-template-columns: repeat(${this.columns}, ${this.size}px);
			}`
		document.querySelector('head').append(style)
		this.updateSizes()
	}

	updateSizes = () => {
		this.board.style.width = `${this.size * this.columns}px`
		this.board.style.height = `${this.size * this.rows}px`
	}

	addEventListeners = () => {
		document.addEventListener('keydown', e => {
			this.keysPressed[e.code] = true
		})
		document.addEventListener('keyup', e => {
			delete this.keysPressed[e.code]
		})
	}

	checkCollisionWithEnemies() {
		const left = this.bomberman.left,
			right = this.bomberman.left + this.bomberman.size,
			top = this.bomberman.top,
			bottom = this.bomberman.top + this.bomberman.size
		for (let enemy of this.enemies) {
			const eLeft = enemy.left,
				eRight = enemy.left + enemy.size,
				eTop = enemy.top,
				eBottom = enemy.top + enemy.size
			if (!(top > eBottom || right < eLeft || left > eRight || bottom < eTop)) {
				this.bomberman.die()
				return true
			}
		}
	}

	updateBomberman = () => {
		if (this.checkCollisionWithEnemies()) {
			this.over = true
			return
		}

		const left = (this.bomberman.left - 1) / this.size + 2,
			right = (this.bomberman.left + this.bomberman.size) / this.size + 2,
			top = (this.bomberman.top - 1) / this.size + 2,
			bottom = (this.bomberman.top + this.bomberman.size) / this.size + 2
		let moved = false
		if (this.keysPressed['KeyA'] && !this.keysPressed['KeyD'])
			if (!this.isBlock(left, top + 0.05) && !this.isBlock(left, bottom - 0.05)) {
				this.bomberman.moveLeft()
				moved = true
			}
		if (this.keysPressed['KeyD'] && !this.keysPressed['KeyA'])
			if (!this.isBlock(right, top + 0.05) && !this.isBlock(right, bottom - 0.05)) {
				this.bomberman.moveRight()
				moved = true
			}
		if (this.keysPressed['KeyW'] && !this.keysPressed['KeyS'])
			if (!this.isBlock(left + 0.05, top) && !this.isBlock(right - 0.05, top)) {
				this.bomberman.moveUp()
				moved = true
			}
		if (this.keysPressed['KeyS'] && !this.keysPressed['KeyW'])
			if (!this.isBlock(left + 0.05, bottom) && !this.isBlock(right - 0.05, bottom)) {
				this.bomberman.moveDown()
				moved = true
			}
		if (!moved) this.bomberman.img.className = `pixel-art bomberman-look-${this.bomberman.direction}`
	}

	updateEnemy = enemy => {
		const left = (enemy.left - 1) / this.size + 2,
			right = (enemy.left + enemy.size) / this.size + 2,
			top = (enemy.top - 1) / this.size + 2,
			bottom = (enemy.top + enemy.size) / this.size + 2
		if (enemy.direction === 'left') {
			if (!this.isBlock(left, top + 0.05) && !this.isBlock(left, bottom - 0.05))
				enemy.moveLeft()
			else
				enemy.direction = getRandomDirection(['right', 'up', 'down'])
			return
		}
		if (enemy.direction === 'right') {
			if (!this.isBlock(right, top + 0.05) && !this.isBlock(right, bottom - 0.05))
				enemy.moveRight()
			else
				enemy.direction = getRandomDirection(['left', 'up', 'down'])
			return
		}
		if (enemy.direction === 'up') {
			if (!this.isBlock(left + 0.05, top) && !this.isBlock(right - 0.05, top))
				enemy.moveUp()
			else
				enemy.direction = getRandomDirection(['left', 'right', 'down'])
			return
		}
		if (enemy.direction === 'down') {
			if (!this.isBlock(left + 0.05, bottom) && !this.isBlock(right - 0.05, bottom))
				enemy.moveDown()
			else
				enemy.direction = getRandomDirection(['left', 'right', 'up'])
		}
	}

	update = () => {
		this.updateBomberman()
		this.enemies.forEach(enemy => {
			this.updateEnemy(enemy)
		})
	}

	draw = () => {
		this.bomberman.draw()
		this.enemies.forEach(enemy => {
			enemy.draw()
		})
	}

	animate = () => {
		const callback = () => {
			if (!this.over) {
				requestAnimationFrame(callback)

				this.update()
				this.draw()
			}
		}
		requestAnimationFrame(callback)
	}
}

new Game({
	pixelSize: 3
})