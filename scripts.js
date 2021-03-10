const getRandomInt = (min, max) => {
	min = Math.ceil(min)
	max = Math.ceil(max)
	return Math.floor(Math.random() * (max - min)) + min
}

const getRandomDirection = (directions = ['left', 'right', 'up', 'down']) => {
	return directions[getRandomInt(0, directions.length)]
}

class Entity {
	constructor({board, pixelSize, left, top, speed}) {
		this.board = board
		this.pixelSize = pixelSize
		this.speed = speed || pixelSize / 3
		this.left = left || pixelSize * 2
		this.top = top || pixelSize * 2
		this.size = 16 * pixelSize * 0.75

		this.createHTML()
		this.draw()
	}

	createHTML = () => {
		this.div = document.createElement('div')
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
}

class Enemy extends Entity {
	constructor({board, pixelSize, left, top}) {
		super({board, pixelSize, left, top})
		this.speed /= 2
		this.direction = getRandomDirection()
		this.dead = false

		this.createHTML()
	}

	createHTML = () => {
		this.div.className = 'enemy'
		this.img.src = './img/enemy.png'
	}

	moveLeft() {
		super.moveLeft()
		this.img.className = 'enemy-walk-left'
		this.direction = 'left'
	}

	moveRight() {
		super.moveRight()
		this.img.className = 'enemy-walk-right'
		this.direction = 'right'
	}

	moveUp() {
		super.moveUp()
		this.img.className = 'enemy-walk-up'
		this.direction = 'up'
	}

	moveDown() {
		super.moveDown()
		this.img.className = 'enemy-walk-down'
		this.direction = 'down'
	}

	die() {
		this.img.className = 'enemy-die'
		this.dead = true
		setTimeout(() => {
			this.img.className = 'enemy-dead'
			this.div.remove()
		}, 500)
	}
}

class Bomberman extends Entity {
	constructor({board, pixelSize, liveCount}) {
		super({board, pixelSize})
		this.direction = 'down'
		this.liveCount = liveCount

		this.createHTML()
	}

	createHTML = () => {
		this.div.id = 'bomberman'
		this.img.src = './img/bomberman.png'
	}

	moveLeft() {
		super.moveLeft()
		this.img.className = 'bomberman-walk-left'
		this.direction = 'left'
	}

	moveRight() {
		super.moveRight()
		this.img.className = 'bomberman-walk-right'
		this.direction = 'right'
	}

	moveUp() {
		super.moveUp()
		this.img.className = 'bomberman-walk-up'
		this.direction = 'up'
	}

	moveDown() {
		super.moveDown()
		this.img.className = 'bomberman-walk-down'
		this.direction = 'down'
	}

	die() {
		this.img.className = 'bomberman-die'
		this.liveCount--
		setTimeout(() => {
			this.img.className = 'bomberman-dead'
		}, 600)
	}
}

class Block {
	constructor({board, x, y}) {
		this.board = board
		this.x = x
		this.y = y

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
	constructor({board, x, y}) {
		super({board, x, y})

		this.addClass()
	}

	addClass = () => {
		this.div.classList.add('rock')
	}
}

class Wall extends Block {
	constructor({board, x, y}) {
		super({board, x, y})

		this.addImage()
	}

	addClass = () => {
		this.div.classList.add('wall')
	}

	addImage = () => {
		this.addClass()

		this.img = document.createElement('img')
		this.img.src = './img/wall.png'
		this.div.append(this.img)
	}

	explode() {
		this.img.classList.add('wall-explode')
	}
}

class Bomb {
	constructor({board, x, y, size, map}) {
		this.board = board
		this.x = x
		this.y = y
		this.size = size
		this.map = map

		this.initialize()
	}

	createHTML = () => {
		this.div = document.createElement('div')
		this.img = document.createElement('img')
		this.div.classList.add('bomb')
		this.div.style.gridColumnStart = String(this.x)
		this.div.style.gridRowStart = String(this.y)
		this.img.src = './img/bomb.png'
		this.div.append(this.img)
		this.board.append(this.div)
	}

	initialize = () => {
		this.createHTML()
	}

	explode = () => {
		this.explosion = new Explosion({board: this.board, x: this.x, y: this.y, size: this.size, map: this.map})
	}
}

class Explosion {
	constructor({board, x, y, size, map}) {
		this.board = board
		this.x = x
		this.y = y
		this.size = size
		this.map = map
		this.arr = []

		this.createHTML()
	}

	create = (x, y, className) => {
		let created = true,
			data
		if (!this.map.isBlock(x, y, true)) {
			const div = document.createElement('div')
			const img = document.createElement('img')
			div.classList.add('explosion')
			img.classList.add(className)
			img.src = './img/explosion.png'
			div.style.gridColumnStart = String(x)
			div.style.gridRowStart = String(y)
			div.append(img)
			this.board.append(div)
			setTimeout(() => {
				this.map.explosions = this.map.explosions.filter(explosion =>
					!(explosion.style.gridRowStart === div.style.gridRowStart && explosion.style.gridColumnStart === div.style.gridColumnStart))
				div.remove()
			}, 500)
			created = true
			data = div
			this.map.explosions.push(data)
		} else if (this.map.isWall(x, y)) {
			const wall = this.map.getWall(x, y)
			wall.explode()
			setTimeout(() => {
				this.map.deleteWall(x, y)
			}, 500)
			created = false
		} else if (this.map.isRock(x, y))
			created = false
		return {created, data}
	}

	createCenter = () => {
		const {data} = this.create(this.x, this.y, 'explosion-center')
		this.arr.push(data)
	}
	createLeft = () => {
		const {data} = this.create(this.x - this.size, this.y, 'explosion-left')
		this.arr.push(data)
	}
	createRight = () => {
		const {data} = this.create(this.x + this.size, this.y, 'explosion-right')
		this.arr.push(data)
	}
	createTop = () => {
		const {data} = this.create(this.x, this.y - this.size, 'explosion-top')
		this.arr.push(data)
	}
	createBottom = () => {
		const {data} = this.create(this.x, this.y + this.size, 'explosion-bottom')
		this.arr.push(data)
	}
	createLeftHorizontals = () => {
		for (let i = this.x - 1; i >= this.x - this.size + 1; i--) {
			const {created, data} = this.create(i, this.y, 'explosion-horizontal')
			if (created)
				this.arr.push(data)
			else
				return false
		}
		return true
	}
	createRightHorizontals = () => {
		for (let i = this.x + 1; i < this.x + this.size; i++) {
			const {created, data} = this.create(i, this.y, 'explosion-horizontal')
			if (created)
				this.arr.push(data)
			else
				return false
		}
		return true
	}
	createTopVerticals = () => {
		for (let i = this.y - 1; i >= this.y - this.size + 1; i--) {
			const {created, data} = this.create(this.x, i, 'explosion-vertical')
			if (created)
				this.arr.push(data)
			else
				return false
		}
		return true
	}
	createBottomVerticals = () => {
		for (let i = this.y + 1; i < this.y + this.size; i++) {
			const {created, data} = this.create(this.x, i, 'explosion-vertical')
			if (created)
				this.arr.push(data)
			else
				return false
		}
		return true
	}

	createHTML = () => {
		this.createCenter()
		if (this.createLeftHorizontals())
			this.createLeft()
		if (this.createRightHorizontals())
			this.createRight()
		if (this.createTopVerticals())
			this.createTop()
		if (this.createBottomVerticals())
			this.createBottom()
	}
}

class KeyListener {
	constructor() {
		this.keysPressed = {}

		this.initialize()
	}

	initialize = () => {
		document.addEventListener('keydown', e => {
			this.keysPressed[e.code] = true
		})
		document.addEventListener('keyup', e => {
			this.keysPressed[e.code] = false
		})
	}

	isPressed = code => this.keysPressed[code]
}

class GameOptions {
	constructor({rows, columns, pixelSize, tileSize, enemyCount, bombCount, explosionTime, explosionSize}) {
		this.rows = rows
		this.columns = columns
		this.pixelSize = pixelSize
		this.tileSize = tileSize
		this.enemyCount = enemyCount
		this.bombCount = bombCount
		this.explosionTime = explosionTime
		this.explosionSize = explosionSize
	}
}

class GameMap {
	constructor({board, rows, columns, pixelSize, tileSize, enemyCount, bombCount, explosionTime, explosionSize}) {
		this.board = board
		this.options = new GameOptions({
			rows, columns, pixelSize, tileSize, enemyCount, bombCount, explosionSize, explosionTime
		})
		this.rocks = []
		this.walls = []
		this.enemies = []
		this.bombs = []
		this.explosions = []

		this.initialize()
	}

	createRocks = () => {
		for (let i = 1; i <= this.options.columns; i++) {
			this.rocks.push(new Rock({x: i, y: 1, board: this.board}))
			this.rocks.push(new Rock({x: i, y: this.options.rows, board: this.board}))
		}
		for (let i = 2; i < this.options.rows; i++) {
			this.rocks.push(new Rock({x: 1, y: i, board: this.board}))
			this.rocks.push(new Rock({x: this.options.columns, y: i, board: this.board}))
		}
		for (let i = 3; i < this.options.columns; i += 2)
			for (let j = 3; j < this.options.rows; j += 2)
				this.rocks.push(new Rock({x: i, y: j, board: this.board}))
	}

	createWalls = () => {
		const count = Math.round(this.options.rows * this.options.columns / 8)
		const wallsCount = getRandomInt(count * 0.9, count * 1.1)
		let sum = 0
		while (sum < wallsCount) {
			const x = getRandomInt(1, this.options.columns),
				y = getRandomInt(1, this.options.rows)
			if (!this.isBlock(x, y) && !(x <= 3 && y <= 3)) {
				this.walls.push(new Wall({x, y, board: this.board}))
				sum++
			}
		}
	}

	createEnemies = () => {
		let sum = 0
		while (sum < this.options.enemyCount) {
			const x = getRandomInt(1, this.options.columns),
				y = getRandomInt(1, this.options.rows)
			if (!this.isBlock(x, y) && !(x <= 5 && y <= 5)) {
				const left = this.options.tileSize * (x - 2) + (2 * this.options.pixelSize),
					top = this.options.tileSize * (y - 2) + (2 * this.options.pixelSize)
				this.enemies.push(new Enemy({left, top, board: this.board, pixelSize: this.options.pixelSize}))
				sum++
			}
		}
	}

	createHTML = () => {
		this.createRocks()
		this.createWalls()
		this.createEnemies()
	}

	addStyles = () => {
		const style = document.createElement('style')
		style.innerHTML = `
			#board {
				grid-template-rows: repeat(${this.options.rows}, ${this.options.tileSize}px);
				grid-template-columns: repeat(${this.options.columns}, ${this.options.tileSize}px);
			}`
		document.querySelector('head').append(style)
		this.board.style.width = `${this.options.tileSize * this.options.columns}px`
		this.board.style.height = `${this.options.tileSize * this.options.rows}px`
	}

	initialize = () => {
		this.createHTML()
		this.addStyles()
	}

	isRock = (x, y) => this.rocks.some(rock => rock.x === x && rock.y === y)

	isWall = (x, y) => this.walls.some(wall => wall.x === x && wall.y === y)

	isBomb = (x, y) => this.bombs.some(bomb => bomb.x === x && bomb.y === y)

	isExplosion = (x, y) => {
		x = Math.floor(x)
		y = Math.floor(y)
		return this.explosions.some(explosion => parseInt(explosion.style.gridColumnStart) === x && parseInt(explosion.style.gridRowStart) === y)
	}

	isBlock = (x, y, withoutBombs = false) => {
		x = Math.floor(x)
		y = Math.floor(y)
		return x < 1 || y < 1 || x > this.options.columns || y > this.options.rows || this.isRock(x, y) || this.isWall(x, y) ||
			(!withoutBombs && this.isBomb(x, y))
	}

	getWall = (x, y) => this.walls.filter(wall => wall.x === x && wall.y === y)[0]

	deleteWall = (x, y) => {
		this.walls = this.walls.filter(wall => {
			if (wall.x === x && wall.y === y) {
				wall.div.remove()
				return false
			}
			return true
		})
	}
}

class GameState {
	constructor() {
		this.paused = false
		this.over = false
		this.won = false
	}
}

class Game {
	constructor({
					rows = 13, columns = 31, pixelSize = 1, enemyCount = 5,
					explosionTime = 2000, explosionSize = 1, bombCount = 1, liveCount = 3
				} = {}) {
		this.board = document.querySelector('#board')
		this.bomberman = new Bomberman({board: this.board, pixelSize, liveCount})
		this.state = new GameState()

		this.keyListener = new KeyListener()
		this.map = new GameMap({
			board: this.board, rows, columns, pixelSize, tileSize: 16 * pixelSize, enemyCount, bombCount,
			explosionTime, explosionSize
		})

		this.animate()
	}

	isCollidedWithEnemies() {
		const left = this.bomberman.left,
			right = this.bomberman.left + this.bomberman.size,
			top = this.bomberman.top,
			bottom = this.bomberman.top + this.bomberman.size
		for (let enemy of this.map.enemies) {
			const eLeft = enemy.left,
				eRight = enemy.left + enemy.size,
				eTop = enemy.top,
				eBottom = enemy.top + enemy.size
			if (!(top > eBottom || right < eLeft || left > eRight || bottom < eTop))
				return true
		}
	}

	isBombermanExploded() {
		const left = this.bomberman.left / this.map.options.tileSize + 2,
			right = (this.bomberman.left + this.bomberman.size) / this.map.options.tileSize + 2,
			top = this.bomberman.top / this.map.options.tileSize + 2,
			bottom = (this.bomberman.top + this.bomberman.size) / this.map.options.tileSize + 2
		return this.map.isExplosion(left, top) || this.map.isExplosion(left, bottom) || this.map.isExplosion(right, top) || this.map.isExplosion(right, bottom)
	}

	handleBombermanDeath() {
		this.bomberman.die()
		if (!this.bomberman.liveCount) {
			this.state.over = true
		}
	}

	updateBomberman = () => {
		if (this.isCollidedWithEnemies()) {
			this.handleBombermanDeath()
			return
		}

		if (this.isBombermanExploded()) {
			this.handleBombermanDeath()
			return
		}

		const left = (this.bomberman.left - 1) / this.map.options.tileSize + 2,
			right = (this.bomberman.left + this.bomberman.size) / this.map.options.tileSize + 2,
			top = (this.bomberman.top - 1) / this.map.options.tileSize + 2,
			bottom = (this.bomberman.top + this.bomberman.size) / this.map.options.tileSize + 2
		let moved = false
		if (this.keyListener.isPressed('KeyA') && !this.keyListener.isPressed('KeyD'))
			if (!this.map.isBlock(left, top + 0.05, true) && !this.map.isBlock(left, bottom - 0.05, true)) {
				this.bomberman.moveLeft()
				moved = true
			}
		if (this.keyListener.isPressed('KeyD') && !this.keyListener.isPressed('KeyA'))
			if (!this.map.isBlock(right, top + 0.05, true) && !this.map.isBlock(right, bottom - 0.05, true)) {
				this.bomberman.moveRight()
				moved = true
			}
		if (this.keyListener.isPressed('KeyW') && !this.keyListener.isPressed('KeyS'))
			if (!this.map.isBlock(left + 0.05, top, true) && !this.map.isBlock(right - 0.05, top, true)) {
				this.bomberman.moveUp()
				moved = true
			}
		if (this.keyListener.isPressed('KeyS') && !this.keyListener.isPressed('KeyW'))
			if (!this.map.isBlock(left + 0.05, bottom, true) && !this.map.isBlock(right - 0.05, bottom, true)) {
				this.bomberman.moveDown()
				moved = true
			}
		if (!moved)
			this.bomberman.img.className = `bomberman-look-${this.bomberman.direction}`
	}

	isEnemyExploded(enemy) {
		const left = enemy.left / this.map.options.tileSize + 2,
			right = (enemy.left + enemy.size - 1) / this.map.options.tileSize + 2,
			top = enemy.top / this.map.options.tileSize + 2,
			bottom = (enemy.top + enemy.size - 1) / this.map.options.tileSize + 2
		if (this.map.isExplosion(left, top) || this.map.isExplosion(left, bottom) || this.map.isExplosion(right, top) || this.map.isExplosion(right, bottom)) {
			this.map.enemies = this.map.enemies.filter(e => e !== enemy)
			enemy.die()
		}
	}

	updateEnemy = enemy => {
		this.isEnemyExploded(enemy)

		if (!enemy.dead) {
			const left = (enemy.left - 1) / this.map.options.tileSize + 2,
				right = (enemy.left + enemy.size) / this.map.options.tileSize + 2,
				top = (enemy.top - 1) / this.map.options.tileSize + 2,
				bottom = (enemy.top + enemy.size) / this.map.options.tileSize + 2
			if (enemy.direction === 'left') {
				if (!this.map.isBlock(left, top + 0.05) && !this.map.isBlock(left, bottom - 0.05))
					enemy.moveLeft()
				else
					enemy.direction = getRandomDirection(['right', 'up', 'down'])
				return
			}
			if (enemy.direction === 'right') {
				if (!this.map.isBlock(right, top + 0.05) && !this.map.isBlock(right, bottom - 0.05))
					enemy.moveRight()
				else
					enemy.direction = getRandomDirection(['left', 'up', 'down'])
				return
			}
			if (enemy.direction === 'up') {
				if (!this.map.isBlock(left + 0.05, top) && !this.map.isBlock(right - 0.05, top))
					enemy.moveUp()
				else
					enemy.direction = getRandomDirection(['left', 'right', 'down'])
				return
			}
			if (enemy.direction === 'down') {
				if (!this.map.isBlock(left + 0.05, bottom) && !this.map.isBlock(right - 0.05, bottom))
					enemy.moveDown()
				else
					enemy.direction = getRandomDirection(['left', 'right', 'up'])
			}
		}
	}

	updateBomb = () => {
		if (this.keyListener.isPressed('Space') && this.map.options.bombCount) {
			const x = Math.floor((this.bomberman.left - 1 + (this.map.options.tileSize / 2)) / this.map.options.tileSize + 2),
				y = Math.floor((this.bomberman.top - 1 + (this.map.options.tileSize / 2)) / this.map.options.tileSize + 2)
			if (!this.map.isBomb(x, y)) {
				this.map.bombs.push(new Bomb({
					board: this.board, x, y, size: this.map.options.explosionSize, map: this.map
				}))
				this.map.options.bombCount--

				setTimeout(() => {
					this.map.options.bombCount++
					this.map.bombs = this.map.bombs.filter(bomb => {
						if (bomb.x === x && bomb.y === y) {
							bomb.div.remove()
							bomb.explode()
							return false
						}
						return true
					})
				}, this.map.options.explosionTime)
			}
		}
	}

	update = () => {
		this.updateBomb()
		this.updateBomberman()
		this.map.enemies.forEach(enemy => this.updateEnemy(enemy))
	}

	draw = () => {
		this.bomberman.draw()
		this.map.enemies.forEach(enemy => enemy.draw())
	}

	animate = () => {
		const callback = () => {
			if (!this.state.over && !this.state.paused) {
				requestAnimationFrame(callback)

				this.update()
				this.draw()
			}
		}
		requestAnimationFrame(callback)
	}
}

new Game({
	pixelSize: 3,
	enemyCount: 7,
	bombCount: 2
})

// TODO:
// bonuses, level win, lives, timer, score, sounds, pause, game over, main menu
// score count after enemy death
// refactor to more classes