const ENEMY_TYPES = ['ballom', 'onil', 'dahl', 'minvo']

const getRandomInt = (min, max) => {
	min = Math.ceil(min)
	max = Math.ceil(max)
	return Math.floor(Math.random() * (max - min)) + min
}

const getRandomDirection = (directions = ['left', 'right', 'up', 'down']) => {
	return directions[getRandomInt(0, directions.length)]
}

const playExplosionSound = () => {
	const sound = document.createElement('audio')
	sound.src = './sounds/explosion.wav'
	sound.play().then()
	sound.volume = 0.05
}

const playBombLeaveSound = () => {
	const sound = document.createElement('audio')
	sound.src = './sounds/leave-bomb.wav'
	sound.play().then()
	sound.volume = 0.05
}

class Timer {
	constructor(callback, delay) {
		this.callback = callback
		this.remaining = delay

		this.resume()
	}

	pause() {
		clearTimeout(this.timerID)
		this.remaining -= new Date().getTime() - this.start
	}

	resume() {
		this.start = new Date().getTime()
		this.clear()
		this.timerID = setTimeout(this.callback, this.remaining)
	}

	clear() {
		clearTimeout(this.timerID)
	}
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
		this.img.alt = 'entity'
		this.div.append(this.img)
		this.board.append(this.div)
		this.div.style.height = `${this.size}px`
		this.div.style.width = `${this.size}px`
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

	draw() {
		this.div.style.position = 'absolute'
		this.div.style.left = `${16 * this.pixelSize + this.left}px`
		this.div.style.top = `${16 * this.pixelSize + this.top}px`
	}

	getBorders(pixelSize, tileSize, {own = true, collideWithDoor = false} = {}) {
		let x = 0
		if (!own)
			x = 1
		if (collideWithDoor)
			x -= pixelSize * 8
		let left, right, top, bottom
		if (this instanceof Bomberman) {
			left = (this.left - x + (pixelSize + 1)) / tileSize + 2
			right = (this.left - 1 + x + this.size - (pixelSize + 1)) / tileSize + 2
			top = (this.top - x) / tileSize + 2
			bottom = (this.top + x + this.size - (pixelSize - 1)) / tileSize + 2
		} else {
			left = (this.left - x) / tileSize + 2
			right = (this.left - 1 + x + this.size) / tileSize + 2
			top = (this.top - x) / tileSize + 2
			bottom = (this.top + x + this.size) / tileSize + 2
		}
		return {left, right, top, bottom}
	}
}

class EnemyXP {
	constructor({board, left, top, amount}) {
		this.board = board
		this.left = left
		this.top = top
		this.amount = amount

		this.initialize()
	}

	initialize = () => {
		this.createHTML()
		this.deleteAfter()
	}

	createHTML = () => {
		this.div = document.createElement('div')
		this.div.className = 'enemy-xp'
		this.div.innerText = this.amount
		this.div.style.left = `${this.left}px`
		this.div.style.top = `${this.top}px`
		this.board.append(this.div)
	}

	deleteAfter = () => {
		new Timer(() => {
			this.div.remove()
		}, 2000)
	}
}

class Enemy extends Entity {
	constructor({board, pixelSize, left, top, xp, type}) {
		super({board, pixelSize, left, top})
		this.direction = getRandomDirection()
		this.dead = false
		this.xp = xp
		this.type = type

		this.handleType()
	}

	handleType = () => {
		switch (this.type) {
			case 'ballom':
				this.xp = 100
				this.speed /= 3
				this.createHTML('./img/enemies/ballom.png')
				break
			case 'onil':
				this.xp = 200
				this.speed /= 2
				this.createHTML('./img/enemies/onil.png')
				break
			case 'dahl':
				this.xp = 400
				this.createHTML('./img/enemies/dahl.png')
				break
			case 'minvo':
				this.xp = 800
				this.speed *= 1.5
				this.createHTML('./img/enemies/minvo.png')
				break
		}
	}

	createHTML = src => {
		this.div.className = 'enemy'
		this.img.src = src
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
		this.timer = new Timer(() => {
			this.img.className = 'enemy-dead'
			this.div.remove()
			new EnemyXP({
				board: this.board,
				left: parseInt(this.div.style.left),
				top: parseInt(this.div.style.top),
				amount: this.xp
			})
		}, 1100)
	}
}

class Bomberman extends Entity {
	constructor({board, pixelSize, liveCount}) {
		super({board, pixelSize})
		this.direction = 'down'
		this.liveCount = liveCount
	}

	resetPosition = () => {
		this.left = 0
		this.top = 0
	}

	initialize = () => {
		this.createHTML()
	}

	createHTML = () => {
		this.div.id = 'bomberman'
		this.img.src = './img/bomberman.png'
		this.img.alt = 'bomberman'
		this.liveCountDiv = document.createElement('div')
		this.liveCountDiv.id = 'live-count'
		const img = document.createElement('img')
		img.src = './img/game-info/heart.png'
		img.alt = 'heart'
		const span = document.createElement('span')
		span.textContent = `${this.liveCount}`
		this.liveCountDiv.append(img)
		this.liveCountDiv.append(span)
		document.querySelector('#game-info').append(this.liveCountDiv)
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
		this.timer = new Timer(() => {
			this.img.className = 'bomberman-dead'
		}, 600)
	}

	restart = () => {
		this.left = this.pixelSize
		this.top = this.pixelSize
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

class ExitDoor extends Block {
	constructor({board, x, y}) {
		super({board, x, y})

		this.addClass()
	}

	addClass = () => {
		this.div.classList.add('exit-door')
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
		this.img.alt = 'wall'
		this.div.append(this.img)
	}

	explode() {
		this.img.classList.add('wall-explode')
	}
}

class Bomb {
	constructor({board, x, y, explosionSize, map}) {
		this.board = board
		this.x = x
		this.y = y
		this.explosionSize = explosionSize
		this.map = map

		this.initialize()
	}

	initialize = () => {
		this.createHTML()
		this.explodeAfter()
	}

	createHTML = () => {
		this.div = document.createElement('div')
		this.img = document.createElement('img')
		this.img.alt = 'bomb'
		this.div.classList.add('bomb')
		this.div.style.gridColumnStart = String(this.x)
		this.div.style.gridRowStart = String(this.y)
		this.img.classList.add('bomb-exploding')
		this.img.src = './img/bomb.png'
		this.div.append(this.img)
		this.board.append(this.div)
	}

	createExplosions = () => {
		this.div.remove()
		this.explosion = new Explosion({
			board: this.board,
			x: this.x,
			y: this.y,
			size: this.explosionSize,
			map: this.map
		})
		playExplosionSound()
	}

	explodeAfter = () => {
		this.timer = new Timer(() => {
			this.createExplosions()
			this.map.deleteBomb(this.x, this.y)
		}, this.map.options.explosionTime)
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

	createHTMLForOne = (x, y, className) => {
		const div = document.createElement('div')
		const img = document.createElement('img')
		div.classList.add('explosion')
		img.classList.add(className)
		img.src = './img/explosion.png'
		img.alt = 'explosion'
		div.style.gridColumnStart = String(x)
		div.style.gridRowStart = String(y)
		div.append(img)
		this.board.append(div)
		return div
	}

	create = (x, y, className) => {
		let created = true,
			data
		if (className !== 'explosion-center' && this.map.isBomb(x, y)) {
			const bomb = this.map.getBomb(x, y)
			bomb.instant = true
			created = false
		} else if (!this.map.isBlock(x, y, true)) {
			data = this.createHTMLForOne(x, y, className)
			this.map.explosions.push(data)
			new Timer(() => {
				this.map.deleteExplosion(data)
			}, 500)
			created = true
		} else if (this.map.isWall(x, y)) {
			const wall = this.map.getWall(x, y)
			wall.explode()
			new Timer(() => {
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

class StageOptions {
	constructor({
		            rows, columns, pixelSize, tileSize, enemies, bombCount, explosionTime, explosionSize,
		            chainExplosionTime, roundTime, score
	            }) {
		this.rows = rows
		this.columns = columns
		this.pixelSize = pixelSize
		this.tileSize = tileSize
		this.enemies = enemies
		this.bombCount = bombCount
		this.explosionTime = explosionTime
		this.explosionSize = explosionSize
		this.chainExplosionTime = chainExplosionTime
		this.roundTime = roundTime
		this.passedTime = 0
		this.score = score
		this.initialScore = score

		this.initialize()
	}

	initialize = () => {
		this.initializeTimer()
		this.initializeScore()
	}

	draw = () => {
		this.drawTimer()
		this.drawScore()
	}

	drawScore = () => {
		this.scoreDiv.querySelector('span').innerText = `${this.score}`
	}

	drawTimer = () => {
		this.timer.querySelector('span').innerText = `${this.roundTime}`
	}

	initializeTimer = () => {
		const timer = document.querySelector('#timer')
		timer && timer.remove()
		this.timer = document.createElement('div')
		this.timer.id = 'timer'
		const img = document.createElement('img')
		img.src = './img/game-info/clock.png'
		img.alt = 'clock'
		const span = document.createElement('span')
		span.innerText = `${this.roundTime}`
		this.timer.append(img)
		this.timer.append(span)
		document.querySelector('#game-info').append(this.timer)
	}

	initializeScore = () => {
		const score = document.querySelector('#score')
		score && score.remove()
		this.scoreDiv = document.createElement('div')
		this.scoreDiv.id = 'score'
		const img = document.createElement('img')
		img.src = './img/game-info/star.png'
		img.alt = 'star'
		const span = document.createElement('span')
		span.innerText = `${this.score}`
		this.scoreDiv.append(img)
		this.scoreDiv.append(span)
		document.querySelector('#game-info').append(this.scoreDiv)
	}

	initializeTimerChange = () => {
		this.resetRoundTime()
		clearInterval(this.interval)
		this.interval = setInterval(() => {
			this.roundTime--
			this.passedTime++
			if (this.roundTime <= 0)
				clearInterval(this.interval)
		}, 1000)
	}

	resetRoundTime = () => {
		this.roundTime += this.passedTime
		this.passedTime = 0
	}
}

class Stage {
	constructor({
		            data, pixelSize, tileSize, bombCount, explosionTime, explosionSize, chainExplosionTime
	            }) {
		if (!(data instanceof Object)) {
			this.error = 'incorrect type of stage'
			return
		}

		const rows = data.rows || 13,
			columns = data.columns || 31,
			roundTime = data.roundTime || 200

		const error = this.checkArguments(rows, columns, roundTime, data.enemies)
		if (error) {
			this.error = error
			return
		}

		this.board = document.querySelector('#board')
		this.bombCount = bombCount
		this.options = new StageOptions({
			rows, columns, pixelSize, tileSize, enemies: data.enemies, bombCount,
			explosionSize, explosionTime, chainExplosionTime, roundTime, score: 0
		})
		this.rocks = []
		this.walls = []
		this.enemies = []
		this.bombs = []
		this.explosions = []
	}

	checkArguments = (rows, columns, roundTime, enemies) => {
		if (isNaN(rows) || rows < 7)
			return 'incorrect number of rows'
		if (isNaN(columns) || columns < 7)
			return 'incorrect number of columns'
		if (isNaN(roundTime) || roundTime < 10)
			return 'incorrect roundTime'
		if (!(enemies instanceof Object))
			return 'incorrect enemies'
		for (const enemyType of Object.keys(enemies)) {
			if (!ENEMY_TYPES.includes(enemyType))
				return `incorrect type of enemy: ${enemyType}`
			if (isNaN(enemies[enemyType]) || enemies[enemyType] < 1)
				return `incorrect number of enemies: ${enemyType}`
		}
	}

	reinitialize = (data) => {
		this.removeAllDivs()
		const rows = data.rows || 13,
			columns = data.columns || 31,
			roundTime = data.roundTime || 200,
			enemies = data.enemies
		const {pixelSize, tileSize, bombCount, explosionSize, explosionTime, chainExplosionTime, score} = this.options
		this.options = new StageOptions({
			rows, columns, pixelSize, tileSize, enemies, bombCount, explosionSize, explosionTime, chainExplosionTime,
			roundTime, score
		})
		this.createHTML()
		this.changeStyles()
	}

	removeAllDivs = () => {
		this.rocks = []
		this.walls = []
		this.enemies = []
		this.bombs = []
		this.explosions = []
		document.querySelectorAll('.rock').forEach(div => div.remove())
		document.querySelectorAll('.wall').forEach(div => div.remove())
		document.querySelectorAll('.enemy').forEach(div => div.remove())
		document.querySelectorAll('.bomb').forEach(div => div.remove())
		document.querySelectorAll('.explosion').forEach(div => div.remove())
		this.exitDoor.div.remove()
	}

	restart = () => {
		this.options.bombCount = this.bombCount
		this.removeAllDivs()
		this.createHTML()
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

	createExitDoor = () => {
		while (true) {
			const x = getRandomInt(1, this.options.columns),
				y = getRandomInt(1, this.options.rows)
			if (this.isWall(x, y)) {
				this.exitDoor = new ExitDoor({board: this.board, x, y})
				return
			}
		}
	}

	createEnemies = () => {
		for (const enemyType of Object.keys(this.options.enemies)) {
			let count = 0
			while (count < this.options.enemies[enemyType]) {
				const x = getRandomInt(1, this.options.columns + 1),
					y = getRandomInt(1, this.options.rows + 1)
				if (!this.isBlock(x, y) && !(x < 5 && y < 5)) {
					const left = this.options.tileSize * (x - 2),
						top = this.options.tileSize * (y - 2)
					this.enemies.push(new Enemy({
						board: this.board, pixelSize: this.options.pixelSize, left, top, type: enemyType
					}))
					count++
				}
			}
		}
	}

	createHTML = () => {
		this.createRocks()
		this.createWalls()
		this.createExitDoor()
		this.createEnemies()
	}

	addStyles = () => {
		const style = document.createElement('style')
		style.id = 'board-style'
		document.querySelector('head').append(style)
	}

	changeStyles = () => {
		const style = document.querySelector('#board-style')
		style.innerHTML = `
			#board {
				grid-template-rows: repeat(${this.options.rows}, ${this.options.tileSize}px);
				grid-template-columns: repeat(${this.options.columns}, ${this.options.tileSize}px);
			}`
		this.board.style.width = `${this.options.tileSize * this.options.columns}px`
		this.board.style.height = `${this.options.tileSize * this.options.rows}px`
	}

	initialize = () => {
		this.createHTML()
		this.addStyles()
		this.changeStyles()
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

	isExitDoor = (x, y) => {
		x = Math.floor(x)
		y = Math.floor(y)
		return parseInt(this.exitDoor.div.style.gridColumnStart) === x && parseInt(this.exitDoor.div.style.gridRowStart) === y
	}

	getWall = (x, y) => this.walls.filter(wall => wall.x === x && wall.y === y)[0]

	getBomb = (x, y) => this.bombs.filter(bomb => bomb.x === x && bomb.y === y)[0]

	deleteWall = (x, y) => {
		this.walls = this.walls.filter(wall => {
			if (wall.x === x && wall.y === y) {
				wall.div.remove()
				return false
			}
			return true
		})
	}

	deleteBomb = (x, y) => {
		this.bombs = this.bombs.filter(bomb => {
			if (bomb.x === x && bomb.y === y) {
				bomb.div.remove()
				clearTimeout(bomb.timeout)
				return false
			}
			return true
		})
		this.options.bombCount++
	}

	deleteExplosion = div => {
		this.explosions = this.explosions.filter(explosion =>
			!(explosion.style.gridRowStart === div.style.gridRowStart && explosion.style.gridColumnStart === div.style.gridColumnStart))
		div.remove()
	}

	deleteEnemy = enemy => {
		this.enemies = this.enemies.filter(e => e !== enemy)
	}

	addBomb = bomb => {
		this.bombs.push(bomb)
		this.options.bombCount--
	}
}

class GameMenu {
	constructor() {
		this.div = document.querySelector('#game-menu')
		this.items = document.querySelectorAll('.game-menu-item')
		this.selected = 0
	}

	show = () => {
		this.selected = 0
		this.div.className = 'game-menu-show'
		document.addEventListener('keyup', this.listener)
	}

	hide = () => {
		this.div.className = 'game-menu-hide'
		document.removeEventListener('keyup', this.listener)
	}

	draw = () => {
		this.items.forEach((item, i) => {
			item.className = 'game-menu-item'
			if (this.selected === i)
				item.classList.add('game-menu-item-selected')
		})
	}

	listener = e => {
		if (e.code === 'ArrowDown')
			this.selected = (this.selected + 1) % this.items.length
		else if (e.code === 'ArrowUp') {
			this.selected = (this.selected - 1) % this.items.length
			if (this.selected < 0)
				this.selected = this.items.length - 1
		}
	}
}

class Music {
	constructor(id) {
		this.audio = document.getElementById(id)
		this.audio.volume = 0.03
	}

	play = () => {
		this.audio.play().then()
	}

	pause = () => {
		this.audio.pause()
	}

	clear = () => {
		this.audio.currentTime = 0
	}

	stop = () => {
		this.pause()
		this.clear()
	}

	durationMS = () => {
		return this.audio.duration * 1000
	}
}

class GameMusic {
	constructor() {
		this.titleScreen = new Music('title-screen-music')
		this.stageStart = new Music('stage-start-music')
		this.stage = new Music('stage-music')
		this.lifeLost = new Music('life-lost-music')
		this.ending = new Music('ending-music')
		this.over = new Music('over-music')
		this.complete = new Music('stage-complete-music')
		this.findExit = new Music('find-exit-music')
		this.pause = new Music('pause-music')
		this.die = new Music('die-music')
	}

	stopStageMusic = () => {
		this.stage.stop()
		this.findExit.stop()
	}
}

class Screen {
	constructor(id) {
		this.div = document.querySelector(`#${id}`)
		this.hide()
	}

	hide = () => {
		this.div.style.opacity = '0'
	}

	show = () => {
		this.div.style.opacity = '1'
	}

	hideDisplay = () => {
		this.div.style.display = 'none'
	}

	showDisplay = () => {
		this.div.style.display = 'flex'
	}
}

class GameScreen {
	constructor() {
		this.mainMenu = new Screen('main-menu')
		this.mainMenu.show()
		this.stageStart = new Screen('stage-start')
		this.gameOver = new Screen('game-over')
		this.gameOver.show()
		this.gameOver.hideDisplay()
		this.stage = new Screen('board')
		this.ending = new Screen('ending')
		this.ending.show()
		this.ending.hideDisplay()
		this.info = new Screen('game-info')
		this.incorrectArguments = new Screen('incorrect-arguments')
		this.incorrectArguments.show()
		this.incorrectArguments.hideDisplay()
	}

	showStage = () => {
		this.stage.show()
		this.info.show()
	}

	hideStage = () => {
		this.stage.hide()
		this.info.hide()
	}
}

class Game {
	constructor({
		            pixelSize = 3, explosionTime = 2000, explosionSize = 1,
		            bombCount = 1, liveCount = 3, chainExplosionTime = 100, stages
	            } = {}) {
		this.screen = new GameScreen()
		const error = this.checkArguments(pixelSize, explosionTime, explosionSize, bombCount, liveCount,
			chainExplosionTime, stages)
		if (error) {
			this.error = error
			return
		}

		this.stageNumber = 0
		this.stages = stages
		this.stage = new Stage({
			data: stages[this.stageNumber], pixelSize, tileSize: 16 * pixelSize, bombCount, explosionTime,
			explosionSize, chainExplosionTime
		})
		if (this.stage.error) {
			this.error = this.stage.error
			return
		}
		this.bomberman = new Bomberman({board: this.stage.board, pixelSize, liveCount})
		this.keyListener = new KeyListener()
		this.gameMenu = new GameMenu()

		this.state = 'click-me'

		this.handleUserInteraction()
	}

	checkArguments = (pixelSize, explosionTime, explosionSize, bombCount, liveCount, chainExplosionTime, stages) => {
		if (isNaN(pixelSize) || pixelSize < 1)
			return 'incorrect pixelSize'
		if (isNaN(explosionTime) || explosionTime < 500)
			return 'incorrect explosionTime'
		if (isNaN(explosionSize) || explosionSize < 1)
			return 'incorrect explosionSize'
		if (isNaN(bombCount) || bombCount < 1)
			return 'incorrect bombCount'
		if (isNaN(liveCount) || liveCount < 1)
			return 'incorrect liveCount'
		if (isNaN(chainExplosionTime) || chainExplosionTime < 1)
			return 'incorrect chainExplosionTime'
		if (!(stages instanceof Array))
			return 'incorrect type of stages'
	}

	handleUserInteraction = () => {
		const clickListener = () => {
			this.music = new GameMusic()
			this.state = 'pre-main-menu'
			document.querySelector('#click-me').remove()
			document.removeEventListener('click', clickListener)
		}
		document.addEventListener('click', clickListener)
	}

	isBombermanCollidedWithEnemies() {
		const {
			left, right, top, bottom
		} = this.bomberman.getBorders(this.stage.options.pixelSize, this.stage.options.tileSize, {own: true})
		for (let enemy of this.stage.enemies) {
			const {
				left: eLeft, right: eRight, top: eTop, bottom: eBottom
			} = enemy.getBorders(this.stage.options.pixelSize, this.stage.options.tileSize, {own: true})
			if (!(top > eBottom || right < eLeft || left > eRight || bottom < eTop))
				return true
		}
	}

	isBombermanExploded() {
		const {
			left, right, top, bottom
		} = this.bomberman.getBorders(this.stage.options.pixelSize, this.stage.options.tileSize, {own: true})
		return this.stage.isExplosion(left, top) || this.stage.isExplosion(left, bottom) || this.stage.isExplosion(right, top) || this.stage.isExplosion(right, bottom)
	}

	handleBombermanDeath() {
		this.bomberman.die()
		this.state = 'pre-pre-die'
	}

	isBombermanCollidedWithExitDoor = () => {
		const {
			left, right, top, bottom
		} = this.bomberman.getBorders(this.stage.options.pixelSize, this.stage.options.tileSize, {
			own: true,
			collideWithDoor: true
		})
		return this.stage.isExitDoor(left, top) || this.stage.isExitDoor(left, bottom) || this.stage.isExitDoor(right, top) || this.stage.isExitDoor(right, bottom)
	}

	updateStage = () => {
		this.stageNumber++
		document.querySelector('#stage-start span').innerText = `${this.stageNumber + 1}`
	}

	updateBomberman() {
		if (this.isBombermanCollidedWithEnemies()) {
			this.handleBombermanDeath()
			return
		}

		if (this.isBombermanExploded()) {
			this.handleBombermanDeath()
			return
		}

		if (!this.stage.enemies.length && this.isBombermanCollidedWithExitDoor()) {
			this.updateStage()
			this.state = 'stage-completed'
			return
		}

		const {
			left, right, top, bottom
		} = this.bomberman.getBorders(this.stage.options.pixelSize, this.stage.options.tileSize, {own: false})

		let moved = false
		if (this.keyListener.isPressed('KeyA') && !this.keyListener.isPressed('KeyD'))
			if (!this.stage.isBlock(left, top + 0.05, true) && !this.stage.isBlock(left, bottom - 0.05, true)) {
				this.bomberman.moveLeft()
				moved = true
			}
		if (this.keyListener.isPressed('KeyD') && !this.keyListener.isPressed('KeyA'))
			if (!this.stage.isBlock(right, top + 0.05, true) && !this.stage.isBlock(right, bottom - 0.05, true)) {
				this.bomberman.moveRight()
				moved = true
			}
		if (this.keyListener.isPressed('KeyW') && !this.keyListener.isPressed('KeyS'))
			if (!this.stage.isBlock(left + 0.05, top, true) && !this.stage.isBlock(right - 0.05, top, true)) {
				this.bomberman.moveUp()
				moved = true
			}
		if (this.keyListener.isPressed('KeyS') && !this.keyListener.isPressed('KeyW'))
			if (!this.stage.isBlock(left + 0.05, bottom, true) && !this.stage.isBlock(right - 0.05, bottom, true)) {
				this.bomberman.moveDown()
				moved = true
			}
		if (!moved)
			this.bomberman.img.className = `bomberman-look-${this.bomberman.direction}`
	}

	handleEnemyExplosion(enemy) {
		const {
			left, right, top, bottom
		} = enemy.getBorders(this.stage.options.pixelSize, this.stage.options.tileSize)
		if (this.stage.isExplosion(left, top) || this.stage.isExplosion(left, bottom) || this.stage.isExplosion(right, top) || this.stage.isExplosion(right, bottom)) {
			this.stage.deleteEnemy(enemy)
			enemy.die()
			this.stage.options.score += enemy.xp
			if (!this.stage.enemies.length) {
				this.state = 'find-exit'
			}
		}
	}

	updateEnemies = () => {
		this.stage.enemies.forEach(enemy => {
			this.updateEnemy(enemy)
		})
	}

	moveEnemyRandomly(enemy) {
		if (!enemy.dead) {
			const {
				left, right, top, bottom
			} = enemy.getBorders(this.stage.options.pixelSize, this.stage.options.tileSize, {own: true})

			if (enemy.direction === 'left') {
				if (!this.stage.isBlock(left, top + 0.05) && !this.stage.isBlock(left, bottom - 0.05))
					enemy.moveLeft()
				else
					enemy.direction = getRandomDirection(['right', 'up', 'down'])
				return
			}
			if (enemy.direction === 'right') {
				if (!this.stage.isBlock(right, top + 0.05) && !this.stage.isBlock(right, bottom - 0.05))
					enemy.moveRight()
				else
					enemy.direction = getRandomDirection(['left', 'up', 'down'])
				return
			}
			if (enemy.direction === 'up') {
				if (!this.stage.isBlock(left + 0.05, top) && !this.stage.isBlock(right - 0.05, top))
					enemy.moveUp()
				else
					enemy.direction = getRandomDirection(['left', 'right', 'down'])
				return
			}
			if (enemy.direction === 'down') {
				if (!this.stage.isBlock(left + 0.05, bottom) && !this.stage.isBlock(right - 0.05, bottom))
					enemy.moveDown()
				else
					enemy.direction = getRandomDirection(['left', 'right', 'up'])
			}
		}
	}

	updateEnemy = enemy => {
		this.handleEnemyExplosion(enemy)
		this.moveEnemyRandomly(enemy)
	}

	updateInstantBombs = () => {
		this.stage.bombs.forEach(bomb => {
			if (bomb.instant) {
				bomb.instant = false
				bomb.timer.clear()
				bomb.timer = new Timer(() => {
					bomb.createExplosions()
					this.stage.deleteBomb(bomb.x, bomb.y)
				}, this.stage.options.chainExplosionTime)
				playExplosionSound()
			}
		})
	}

	updateBombs = () => {
		if (this.keyListener.isPressed('Space') && this.stage.options.bombCount) {
			const x = Math.floor((this.bomberman.left - 1 + (this.stage.options.tileSize / 2)) / this.stage.options.tileSize + 2),
				y = Math.floor((this.bomberman.top - 1 + (this.stage.options.tileSize / 2)) / this.stage.options.tileSize + 2)
			if (!this.stage.isBomb(x, y)) {
				const bomb = new Bomb({
					board: this.stage.board, x, y, explosionSize: this.stage.options.explosionSize, map: this.stage
				})
				this.stage.addBomb(bomb)
				playBombLeaveSound()
			}
		}
		this.updateInstantBombs()
	}

	update() {
		this.updateBombs()
		this.updateBomberman()
		this.updateEnemies()

		if (this.stage.options.roundTime === 0) {
			this.handleBombermanDeath()
			this.state = 'pre-pre-die'
		}
	}

	drawEnemies = () => {
		this.stage.enemies.forEach(enemy => {
			enemy.draw()
		})
	}

	draw = () => {
		this.bomberman.draw()
		this.bomberman.liveCountDiv.querySelector('span').innerText = `${this.bomberman.liveCount}`
		this.drawEnemies()
		this.stage.options.draw()
	}

	initialize = () => {
		this.screen.mainMenu.hideDisplay()
		this.stage.initialize()
		this.bomberman.initialize()

		this.addPauseHandler()
	}

	addPauseHandler = () => {
		document.addEventListener('keyup', e => {
			if (e.code === 'Escape') {
				if (this.state === 'stage') {
					this.state = 'pre-pause'
				} else if (this.state === 'pause') {
					this.state = 'pre-pre-resume'
				}
			}
		})
	}

	pauseBomberman = () => {
		this.bomberman.timer && this.bomberman.timer.pause()
		this.bomberman.img.className = `bomberman-look-${this.bomberman.direction}`
	}

	resumeBomberman = () => {
		this.bomberman.timer && this.bomberman.timer.resume()
	}

	pauseEnemies = () => {
		this.stage.enemies.forEach(enemy => {
			enemy.img.className = `enemy-look-${enemy.direction}`
			enemy.timer && enemy.timer.pause()
		})
	}

	resumeEnemies = () => {
		this.stage.enemies.forEach(enemy => {
			enemy.timer && enemy.timer.resume()
		})
	}

	pauseBombs = () => {
		this.stage.bombs.forEach(bomb => {
			bomb.timer && bomb.timer.pause()
			bomb.img.className = 'bomb-paused'
		})
	}

	resumeBombs = () => {
		this.stage.bombs.forEach(bomb => {
			bomb.timer && bomb.timer.resume()
			bomb.img.className = 'bomb-exploding'
		})
	}

	restart = () => {
		this.stage.restart()
		this.bomberman.restart()
	}

	gameMenuListener = e => {
		if (e.code === 'Enter') {
			if (this.gameMenu.selected === 0) {
				this.state = 'pre-pre-resume'
			} else if (this.gameMenu.selected === 1) {
				this.restart()
				this.state = 'pre-pre-resume'
			} else if (this.gameMenu.selected === 2) {
				location.reload()
			}
		}
	}

	pause = () => {
		this.pauseBomberman()
		this.pauseEnemies()
		this.pauseBombs()

		document.addEventListener('keyup', this.gameMenuListener)
		this.gameMenu.show()
	}

	resume = () => {
		this.resumeBomberman()
		this.resumeEnemies()
		this.resumeBombs()

		document.removeEventListener('keyup', this.gameMenuListener)
		this.gameMenu.hide()
	}

	run() {
		let prevTime = 0
		const callback = (currTime) => {
			requestAnimationFrame(callback)

			if (this.error) {
				document.querySelector('#incorrect-arguments').textContent = this.error
				this.screen.incorrectArguments.showDisplay()
				this.state = 'INCORRECT-ARGUMENTS'
			}

			if (this.state === 'pre-main-menu') {
				this.screen.mainMenu.showDisplay()
				this.music.titleScreen.play()
				this.state = 'main-menu'
			} else if (this.state === 'main-menu' && this.keyListener.isPressed('Enter')) {
				this.state = 'initialize'
				this.music.titleScreen.stop()
			} else if (this.state === 'initialize') {
				this.screen.hideStage()
				this.initialize()
				this.state = 'pre-stage-start'
			} else if (this.state === 'pre-stage-start') {
				this.screen.stageStart.show()
				this.screen.hideStage()
				this.state = 'stage-start'
				this.music.stageStart.play()
				prevTime = currTime
			} else if (this.state === 'stage-start') {
				if (currTime - prevTime >= this.music.stageStart.durationMS()) {
					this.screen.stageStart.hide()
					this.screen.showStage()
					this.state = 'pre-stage'
				}
			} else if (this.state === 'pre-stage') {
				this.screen.showStage()
				this.music.stage.play()
				this.stage.options.initializeTimerChange()
				this.state = 'stage'
			} else if (this.state === 'stage') {
				prevTime = currTime
				this.update()
				this.draw()
			} else if (this.state === 'pre-pause') {
				this.music.stopStageMusic()
				this.music.pause.stop()
				this.music.pause.play()
				this.pause()
				this.state = 'pause'
			} else if (this.state === 'pause') {
				this.gameMenu.draw()
			} else if (this.state === 'pre-pre-resume') {
				prevTime = currTime
				this.music.pause.clear()
				this.state = 'pre-resume'
			} else if (this.state === 'pre-resume') {
				this.music.pause.stop()
				this.music.pause.play()
				this.gameMenu.hide()
				this.state = 'resume'
			} else if (this.state === 'resume') {
				if (currTime - prevTime >= this.music.pause.durationMS() / 2) {
					this.resume()
					this.state = 'pre-stage'
				}
			} else if (this.state === 'over') {
				this.music.stopStageMusic()
				this.music.over.play()
				this.screen.hideStage()
				this.screen.gameOver.showDisplay()
				this.state = 'game-over'
			} else if (this.state === 'pre-pre-die') {
				this.music.stopStageMusic()
				this.pauseEnemies()
				this.music.die.play()
				this.state = 'pre-die'
			} else if (this.state === 'pre-die') {
				if (currTime - prevTime >= this.music.die.durationMS()) {
					this.music.die.stop()
					this.music.lifeLost.play()
					this.stage.options.score = this.stage.options.initialScore
					this.state = 'die'
				}
			} else if (this.state === 'die') {
				if (currTime - prevTime >= (this.music.die.durationMS() + this.music.lifeLost.durationMS())) {
					prevTime = currTime
					if (this.bomberman.liveCount) {
						this.state = 'restart'
						this.stage.options.resetRoundTime()
					} else
						this.state = 'over'
				}
			} else if (this.state === 'restart') {
				this.restart()
				this.state = 'pre-stage-start'
			} else if (this.state === 'find-exit') {
				this.music.stage.stop()
				this.music.findExit.play()
				this.state = 'stage'
			} else if (this.state === 'stage-completed') {
				this.pauseBomberman()
				this.music.stopStageMusic()
				this.music.complete.play()
				if (currTime - prevTime >= this.music.complete.durationMS()) {
					if (this.stageNumber < this.stages.length) {
						this.stage.reinitialize(this.stages[this.stageNumber])
						this.bomberman.resetPosition()
						this.state = 'pre-stage-start'
					} else
						this.state = 'ending'
				}
			} else if (this.state === 'ending') {
				this.screen.info.hide()
				this.screen.stage.hideDisplay()
				this.music.ending.play()
				this.screen.ending.showDisplay()
				this.state = 'END'
			}
		}
		requestAnimationFrame(callback)
	}
}

const game = new Game({
	pixelSize: 2,
	stages: [
		{rows: 11, columns: 11, enemies: {ballom: 3}}
		// {enemies: {ballom: 3, onil: 3}},
		// {enemies: {ballom: 2, onil: 2, dahl: 2}}
	]
})
game.run()

// enemy types: ballom, onil, dahl, minvo

// TODO:
// stage change: when initializing game just pass array of stages; a stage is 2d array of 0's and 1's; 0-nothing, 1-rock
// add enemies who can pass through wall
// add different enemy logic
// powerUps: 
//          bombs: increase max bomb count (max 10)
//          flames: increase bomb explosion size
//          speed: increase movement speed
//          wallPass: pass through walls
//          detonator: detonate the oldest bomb
//          bombPass: pass through bombs (first, remove this ability from bomberman)
//          flamePass: immunity to explosions
//          mystery: temporary invincibility
// fix the movement of the Entity: if the distance to the wall is less than speed of the entity, move by the difference
// add bomberman walk sounds
// pause game when user looses focus
// update collision with door
// show score at end of the game
// add backend:
//          add page, where user can write his nickname and send his score to the backend
//          add page, where user can see scores of the other players, from highest to the lowest
// add animation to the last page
// add responsive design: just resize if the gameBoard is smaller than the device screen
// change document title depending on the state of the game

