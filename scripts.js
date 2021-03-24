const PIXEL_SIZE = 2,
	TILE_SIZE = PIXEL_SIZE * 16,
	DEFAULT_ROWS = 13,
	DEFAULT_COLUMNS = 31,
	EXPLOSION_TIME = 2000,
	WALL_EXPLOSION_TIME = 500

const ENEMY_TYPES = ['ballom', 'onil', 'dahl', 'minvo'],
	POWER_UP_TYPES = ['bombs', 'flames', 'speed', 'wall-pass', 'detonator', 'bomb-pass', 'flame-pass', 'mystery']

const POWER_UP_SPEED_BOOST = 0.3,
	POWER_UP_INVINCIBLE_TIME = 30000

let SFX_VOLUME = 0.2,
	MUSIC_VOLUME = 0.2

const ENEMY_XP_SHOW_TIME = 2000,
	ENEMY_DYING_TIME = 1100,
	BOMBERMAN_DYING_TIME = 600,
	CHAIN_EXPLOSION_TIME = 100

let ENEMY_ID = 0


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
	sound.volume = SFX_VOLUME
	sound.play().then()
}

const playBombLeaveSound = () => {
	const sound = document.createElement('audio')
	sound.src = './sounds/leave-bomb.wav'
	sound.volume = SFX_VOLUME
	sound.play().then()
}

const playPowerUpPickedSound = () => {
	const sound = document.createElement('audio')
	sound.src = './sounds/power-up.wav'
	sound.volume = SFX_VOLUME
	sound.play().then()
}

const playChangeVolumeSound = volume => {
	const sound = document.createElement('audio')
	sound.src = './sounds/volume-change.wav'
	sound.volume = volume
	sound.play().then()
}

const createId = (x, y) => `${x}-${y}`

const changeTitle = title => {
	document.title = title
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
	constructor({board, left, top, speed}) {
		this.board = board
		this.speed = speed || PIXEL_SIZE / 2
		this.left = left || PIXEL_SIZE * 2
		this.top = top || PIXEL_SIZE * 2
		this.size = 16 * PIXEL_SIZE * 0.75
		this.wallPass = false

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
		this.div.style.transform = `translate3d(${16 * PIXEL_SIZE + Math.floor(this.left)}px, ${16 * PIXEL_SIZE + Math.floor(this.top)}px, 0)`
	}

	getBorders({own = true, floorValues = false} = {}) {
		let x = 0
		if (!own)
			x = 1
		let left, right, top, bottom
		if (this instanceof Bomberman) {
			left = (this.left - x + (PIXEL_SIZE + 1)) / TILE_SIZE + 2
			right = (this.left + x + this.size - (PIXEL_SIZE + 1)) / TILE_SIZE + 2
			top = (this.top - x) / TILE_SIZE + 2
			bottom = (this.top + x - 1 + this.size - (PIXEL_SIZE - 1)) / TILE_SIZE + 2
		} else {
			left = (this.left - x) / TILE_SIZE + 2
			right = (this.left + x + this.size) / TILE_SIZE + 2
			top = (this.top - x) / TILE_SIZE + 2
			bottom = (this.top + x + this.size) / TILE_SIZE + 2
		}
		if (floorValues) {
			left = Math.floor(left)
			right = Math.floor(right)
			top = Math.floor(top)
			bottom = Math.floor(bottom)
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

	initialize() {
		this.createHTML()
		this.deleteAfter()
	}

	createHTML() {
		this.div = document.createElement('div')
		this.div.className = 'enemy-xp'
		this.div.innerText = this.amount
		this.div.style.transform = `translate3d(${this.left}px, ${this.top + (3 * PIXEL_SIZE)}px, 0)`
		this.board.append(this.div)
	}

	deleteAfter = () => {
		new Timer(() => {
			this.div.remove()
		}, ENEMY_XP_SHOW_TIME)
	}
}

class Enemy extends Entity {
	constructor({board, left, top, xp, type}) {
		super({board, left, top})
		this.id = ENEMY_ID
		ENEMY_ID++
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
				left: this.left,
				top: this.top,
				amount: this.xp
			})
		}, ENEMY_DYING_TIME)
	}
}

class Bomberman extends Entity {
	constructor({board, liveCount}) {
		super({board})
		this.direction = 'down'
		this.liveCount = liveCount
		this.bombPass = false
		this.flamePass = false
		this.detonator = false
		this.invincible = false
		this.isSurroundedWithBombs = false
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
		}, BOMBERMAN_DYING_TIME)
	}

	restart = () => {
		this.left = PIXEL_SIZE
		this.top = PIXEL_SIZE
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
		this.id = createId(x, y)

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

class PowerUp extends Block {
	constructor({board, x, y, type}) {
		super({board, x, y})
		this.id = createId(x, y)
		this.type = type

		this.addClass()
	}

	addClass = () => {
		this.div.classList.add('power-up', `power-up-${this.type}`)
	}
}

class Wall extends Block {
	constructor({board, x, y}) {
		super({board, x, y})
		this.id = createId(x, y)

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
	constructor({board, x, y, explosionSize, stage}) {
		this.board = board
		this.x = x
		this.y = y
		this.id = createId(x, y)
		this.explosionSize = explosionSize
		this.stage = stage

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
		const explosion = new Explosion({
			board: this.board,
			x: this.x,
			y: this.y,
			size: this.explosionSize,
			stage: this.stage
		})
		new Timer(() => {
			this.stage.deleteExplosion(this.x, this.y)
		}, WALL_EXPLOSION_TIME)
		this.stage.explosions.set(explosion.id, explosion)
		playExplosionSound()
	}

	explodeAfter = () => {
		this.timer = new Timer(() => {
			this.createExplosions()
			this.stage.deleteBomb(this.x, this.y)
		}, EXPLOSION_TIME)
	}
}

class Explosion {
	constructor({board, x, y, size, stage}) {
		this.board = board
		this.x = x
		this.y = y
		this.id = createId(x, y)
		this.size = size
		this.stage = stage
		this.divs = new Map()

		this.createHTML()
	}

	deleteDivs = () => {
		for (const [, div] of this.divs)
			div.remove()
	}

	createHTMLForOne = (x, y, className, hidden = false) => {
		const div = document.createElement('div')
		const img = document.createElement('img')
		if (hidden)
			div.style.opacity = '0'
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
			div
		if (className !== 'explosion-center' && this.stage.isBomb(x, y)) {
			const bomb = this.stage.getBomb(x, y)
			bomb.instant = true
			created = false
		} else if (!this.stage.isBlock(x, y, {bombPass: true})) {
			div = this.createHTMLForOne(x, y, className)
			created = true
		} else if (this.stage.isWall(x, y)) {
			div = this.createHTMLForOne(x, y, className, true)
			created = true
			const wall = this.stage.getWall(x, y)
			wall.explode()
			new Timer(() => {
				this.stage.deleteWall(x, y)
			}, WALL_EXPLOSION_TIME)
			created = false
		} else if (this.stage.isRock(x, y))
			created = false
		const id = createId(x, y)
		return {id, created, div}
	}

	createCenter = () => {
		const {id, div, created} = this.create(this.x, this.y, 'explosion-center')
		if (created)
			this.divs.set(id, div)
	}
	createLeft = () => {
		const {id, div, created} = this.create(this.x - this.size, this.y, 'explosion-left')
		if (created)
			this.divs.set(id, div)
	}
	createRight = () => {
		const {id, div, created} = this.create(this.x + this.size, this.y, 'explosion-right')
		if (created)
			this.divs.set(id, div)
	}
	createTop = () => {
		const {id, div, created} = this.create(this.x, this.y - this.size, 'explosion-top')
		if (created)
			this.divs.set(id, div)
	}
	createBottom = () => {
		const {id, div, created} = this.create(this.x, this.y + this.size, 'explosion-bottom')
		if (created)
			this.divs.set(id, div)
	}
	createLeftHorizontals = () => {
		for (let i = this.x - 1; i >= this.x - this.size + 1; i--) {
			const {id, created, div} = this.create(i, this.y, 'explosion-horizontal')
			if (created)
				this.divs.set(id, div)
			else
				return false
		}
		return true
	}
	createRightHorizontals = () => {
		for (let i = this.x + 1; i < this.x + this.size; i++) {
			const {id, created, div} = this.create(i, this.y, 'explosion-horizontal')
			if (created)
				this.divs.set(id, div)
			else
				return false
		}
		return true
	}
	createTopVerticals = () => {
		for (let i = this.y - 1; i >= this.y - this.size + 1; i--) {
			const {id, created, div} = this.create(this.x, i, 'explosion-vertical')
			if (created)
				this.divs.set(id, div)
			else
				return false
		}
		return true
	}
	createBottomVerticals = () => {
		for (let i = this.y + 1; i < this.y + this.size; i++) {
			const {id, created, div} = this.create(this.x, i, 'explosion-vertical')
			if (created)
				this.divs.set(id, div)
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
		this.keysPressed = new Map()

		this.initialize()
	}

	initialize = () => {
		document.addEventListener('keydown', e => {
			this.keysPressed.set(e.code, true)
		})
		document.addEventListener('keyup', e => {
			this.keysPressed.set(e.code, false)
		})
	}

	isPressed = code => this.keysPressed.get(code)
}

class StageOptions {
	constructor({rows, columns, enemies, bombCount, explosionSize, roundTime, score, powerUps}) {
		this.rows = rows
		this.columns = columns
		this.enemies = enemies
		this.bombCount = bombCount
		this.explosionSize = explosionSize
		this.roundTime = roundTime
		this.passedTime = 0
		this.score = score
		this.initialScore = score
		this.powerUps = powerUps

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
		this.timerDiv.querySelector('span').innerText = `${this.roundTime}`
	}

	initializeTimer = () => {
		const timerDiv = document.querySelector('#timer')
		timerDiv && timerDiv.remove()
		this.timerDiv = document.createElement('div')
		this.timerDiv.id = 'timer'
		const img = document.createElement('img')
		img.src = './img/game-info/clock.png'
		img.alt = 'clock'
		const span = document.createElement('span')
		span.innerText = `${this.roundTime}`
		this.timerDiv.append(img)
		this.timerDiv.append(span)
		document.querySelector('#game-info').append(this.timerDiv)
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
		this.timer && this.timer.clear()
		this.timer = new Timer(() => {
			this.roundTime--
			this.passedTime++
			if (this.roundTime <= 0)
				this.timer.clear()
		}, 1000)
	}

	resetRoundTime = () => {
		this.roundTime += this.passedTime
		this.passedTime = 0
	}
}

class Stage {
	constructor({data, bombCount, explosionSize}) {
		if (!(data instanceof Object)) {
			this.error = 'incorrect type of stage'
			return
		}

		const rows = data.rows || DEFAULT_ROWS,
			columns = data.columns || DEFAULT_COLUMNS,
			roundTime = data.roundTime || 200,
			enemies = data.enemies || {},
			powerUps = data.powerUps || {}

		const error = this.checkArguments(rows, columns, roundTime, enemies, powerUps)
		if (error) {
			this.error = error
			return
		}

		this.board = document.querySelector('#board')
		this.bombCount = bombCount
		this.options = new StageOptions({
			rows, columns, enemies: data.enemies, bombCount, powerUps: data.powerUps,
			explosionSize, roundTime, score: 0
		})
		this.rocks = new Map()
		this.walls = new Map()
		this.bombs = new Map()
		this.powerUps = new Map()
		this.consumedPowerUps = new Map()
		this.enemies = new Map()
		this.explosions = new Map()
	}

	updateBombCountBy = val => {
		this.bombCount += val
		this.options.bombCount += val
	}

	checkArguments = (rows, columns, roundTime, enemies, powerUps) => {
		if (isNaN(rows) || rows < 7)
			return 'incorrect number of rows'
		if (isNaN(columns) || columns < 7)
			return 'incorrect number of columns'
		if (isNaN(roundTime) || roundTime < 10)
			return 'incorrect roundTime'
		if (!(enemies instanceof Object))
			return 'incorrect enemies'
		if (enemies)
			for (const enemyType of Object.keys(enemies)) {
				if (!ENEMY_TYPES.includes(enemyType))
					return `incorrect type of enemy: ${enemyType}`
				if (isNaN(enemies[enemyType]) || enemies[enemyType] < 1)
					return `incorrect number of enemies: ${enemyType}`
			}
		if (powerUps !== undefined && !(powerUps instanceof Object))
			return 'incorrect type of powerUps'
		if (powerUps)
			for (const powerUpType of Object.keys(powerUps)) {
				if (!POWER_UP_TYPES.includes(powerUpType))
					return `incorrect type of powerUp: ${powerUpType}`
				if (isNaN(powerUps[powerUpType]) || powerUps[powerUpType] < 1)
					return `incorrect number of enemies: ${powerUpType}`
			}
	}

	reinitialize = data => {
		this.removeAllDivs()
		const rows = data.rows || DEFAULT_ROWS,
			columns = data.columns || DEFAULT_COLUMNS,
			roundTime = data.roundTime || 200,
			enemies = data.enemies,
			powerUps = data.powerUps || {}
		const {bombCount, explosionSize, score} = this.options
		this.options = new StageOptions({
			rows, columns, enemies, bombCount, explosionSize, roundTime, score, powerUps
		})
		this.createHTML()
		this.changeStyles()
	}

	removeMapElements = prop => {
		for (const [itemId] of this[prop])
			this[prop].get(itemId).div.remove()
		this[prop].clear()
	}

	removeExplosions = () => {
		for (const [, explosion] of this.explosions) {
			for (const [, div] of explosion.divs)
				div.remove()
		}
		this.explosions.clear()
	}

	removeAllDivs = () => {
		this.removeMapElements('rocks')
		this.removeMapElements('walls')
		this.removeMapElements('powerUps')
		this.removeMapElements('enemies')
		this.removeExplosions()
		this.exitDoor.div.remove()
	}

	restart = () => {
		this.options.bombCount = this.bombCount
		this.removeAllDivs()
		this.createHTML()
	}

	createRocks = () => {
		for (let i = 1; i <= this.options.columns; i++) {
			const rock1 = new Rock({board: this.board, x: i, y: 1}),
				rock2 = new Rock({board: this.board, x: i, y: this.options.rows})
			this.rocks.set(rock1.id, rock1)
			this.rocks.set(rock2.id, rock2)
		}
		for (let i = 2; i < this.options.rows; i++) {
			const rock1 = new Rock({board: this.board, x: 1, y: i}),
				rock2 = new Rock({board: this.board, x: this.options.columns, y: i})
			this.rocks.set(rock1.id, rock1)
			this.rocks.set(rock2.id, rock2)
		}
		for (let i = 3; i < this.options.columns; i += 2)
			for (let j = 3; j < this.options.rows; j += 2) {
				const rock = new Rock({board: this.board, x: i, y: j})
				this.rocks.set(rock.id, rock)
			}
	}

	createWalls = () => {
		const count = Math.round(this.options.rows * this.options.columns / 8)
		const wallsCount = getRandomInt(count * 0.9, count * 1.1)
		let sum = 0
		while (sum < wallsCount) {
			const x = getRandomInt(1, this.options.columns + 1),
				y = getRandomInt(1, this.options.rows + 1)
			if (!this.isBlock(x, y) && !(x <= 3 && y <= 3)) {
				const wall = new Wall({x, y, board: this.board})
				this.walls.set(wall.id, wall)
				sum++
			}
		}
	}

	createPowerUps = () => {
		if (this.options.powerUps)
			for (const powerUpType of Object.keys(this.options.powerUps)) {
				let count = 0
				while (count < this.options.powerUps[powerUpType]) {
					const x = getRandomInt(1, this.options.columns + 1),
						y = getRandomInt(1, this.options.rows + 1)
					if (!this.isPowerUp(x, y) && this.isWall(x, y) && !this.isExitDoor(x, y)) {
						const powerUp = new PowerUp({board: this.board, x, y, type: powerUpType})
						this.powerUps.set(powerUp.id, powerUp)
						count++
					}
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
		if (this.options.enemies)
			for (const enemyType of Object.keys(this.options.enemies)) {
				let count = 0
				while (count < this.options.enemies[enemyType]) {
					const x = getRandomInt(1, this.options.columns + 1),
						y = getRandomInt(1, this.options.rows + 1)
					if (!this.isBlock(x, y) && !(x < 5 && y < 5)) {
						const left = TILE_SIZE * (x - 2),
							top = TILE_SIZE * (y - 2)
						const enemy = new Enemy({
							board: this.board, left, top, type: enemyType
						})
						this.enemies.set(enemy.id, enemy)
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
		this.createPowerUps()
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
				grid-template-rows: repeat(${this.options.rows}, ${TILE_SIZE}px);
				grid-template-columns: repeat(${this.options.columns}, ${TILE_SIZE}px);
			}`
		this.board.style.width = `${TILE_SIZE * this.options.columns}px`
		this.board.style.height = `${TILE_SIZE * this.options.rows}px`
	}

	initialize = () => {
		this.createHTML()
		this.addStyles()
		this.changeStyles()
	}

	isPowerUp = (x, y) => {
		const id = createId(x, y)
		return this.powerUps.has(id)
	}

	isRock = (x, y) => {
		const id = createId(x, y)
		return this.rocks.has(id)
	}

	isWall = (x, y) => {
		const id = createId(x, y)
		return this.walls.has(id)
	}

	isBomb = (x, y) => {
		const id = createId(x, y)
		return this.bombs.has(id)
	}

	isExplosion = (x, y, {flamePass = false} = {}) => {
		const id = createId(x, y)
		if (!flamePass)
			for (const [, explosion] of this.explosions)
				for (const [divId] of explosion.divs)
					if (divId === id)
						return true
		return false
	}

	isExitDoor = (x, y) => this.exitDoor.x === x && this.exitDoor.y === y && !this.isWall(x, y)

	isBlock = (x, y, {bombPass = false, wallPass = false, enemy = false} = {}) => {
		x = Math.floor(x)
		y = Math.floor(y)
		return x < 1 || y < 1 || x > this.options.columns || y > this.options.rows || this.isRock(x, y) ||
			(!wallPass && this.isWall(x, y)) || (!bombPass && this.isBomb(x, y)) || (enemy && this.isExitDoor(x, y))
	}

	getWall = (x, y) => {
		const id = createId(x, y)
		return this.walls.get(id)
	}

	getBomb = (x, y) => {
		const id = createId(x, y)
		return this.bombs.get(id)
	}

	getPowerUp = (x, y) => {
		const id = createId(x, y)
		return this.powerUps.get(id)
	}

	deleteWall = (x, y) => {
		const id = createId(x, y)
		const wall = this.getWall(x, y)
		wall && wall.div && wall.div.remove()
		this.walls.delete(id)
	}

	deletePowerUp = (x, y) => {
		const id = createId(x, y)
		const powerUp = this.getPowerUp(x, y)
		powerUp.div.remove()
		this.powerUps.delete(id)
	}

	deleteBomb = (x, y) => {
		const id = createId(x, y)
		const bomb = this.bombs.get(id)
		bomb.timer.clear()
		bomb.div.remove()
		this.bombs.delete(id)
		this.options.bombCount++
	}

	deleteExplosion = (x, y) => {
		const id = createId(x, y)
		for (const [, explosion] of this.explosions) {
			for (const [divId] of explosion.divs) {
				if (divId === id) {
					explosion.deleteDivs()
					this.explosions.delete(id)
					return
				}
			}
		}
	}

	deleteEnemy = id => {
		this.enemies.delete(id)
	}

	addBomb(bomb) {
		this.bombs.set(bomb.id, bomb)
		this.options.bombCount--
	}
}

class GameMenu {
	constructor(gameMusic) {
		this.div = document.querySelector('#game-menu')
		this.items = document.querySelectorAll('.game-menu-item')
		this.ranges = document.querySelectorAll('.game-menu-item input[type="range"]')
		this.selected = 0

		this.sounds = gameMusic

		this.initializeInputs()
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
		if (this.selected === 2) {
			this.ranges[0].disabled = false
			this.ranges[1].disabled = true
			this.ranges[0].focus()
		}
		if (this.selected === 3) {
			this.ranges[0].disabled = true
			this.ranges[1].disabled = false
			this.ranges[1].focus()
		}
		if (this.selected !== 2 && this.selected !== 3) {
			this.unFocusAll()
		}
		this.items.forEach((item, i) => {
			item.className = 'game-menu-item'
			if (this.selected === i)
				item.classList.add('game-menu-item-selected')
		})
	}

	changeVolume = index => {
		if (index === 0) {
			SFX_VOLUME = this.ranges[0].value
			playChangeVolumeSound(SFX_VOLUME)
		} else if (index === 1) {
			MUSIC_VOLUME = this.ranges[1].value
			playChangeVolumeSound(MUSIC_VOLUME)
		}
		this.sounds.changeSFXVolume(SFX_VOLUME)
		this.sounds.changeMusicVolume(MUSIC_VOLUME)
	}

	initializeInputs = () => {
		const callback = e => {
			const i = this.selected - 2
			if (e.code === 'ArrowLeft') {
				this.ranges[i].stepDown()
				this.changeVolume(i)
				this.ranges[i].stepUp()
			} else if (e.code === 'ArrowRight') {
				this.ranges[i].stepUp()
				this.changeVolume(i)
				this.ranges[i].stepDown()
			} else if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
				e.preventDefault()
			}
		}

		for (const range of this.ranges) {
			range.addEventListener('keydown', callback)
			range.addEventListener('click', e => e.preventDefault())
		}
	}

	unFocusAll = () => {
		for (const range of this.ranges) {
			range.blur()
			range.disabled = true
		}
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
	constructor(id, music) {
		this.audio = document.getElementById(id)
		this.audio.volume = SFX_VOLUME
		if (music)
			this.audio.volume = MUSIC_VOLUME
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
		this.titleScreen = new Music('title-screen-music', true)
		this.stageStart = new Music('stage-start-music', true)
		this.stage = new Music('stage-music', true)
		this.lifeLost = new Music('life-lost-music', true)
		this.ending = new Music('ending-music', true)
		this.over = new Music('over-music', true)
		this.complete = new Music('stage-complete-music', true)
		this.findExit = new Music('find-exit-music', true)
		this.pause = new Music('pause-music')
		this.die = new Music('die-music')
	}

	stopStageMusic = () => {
		this.stage.stop()
		this.findExit.stop()
	}

	changeSFXVolume = val => {
		this.pause.audio.volume = val
		this.die.audio.volume = val
	}

	changeMusicVolume = val => {
		this.titleScreen.audio.volume = val
		this.stageStart.audio.volume = val
		this.stage.audio.volume = val
		this.lifeLost.audio.volume = val
		this.ending.audio.volume = val
		this.over.audio.volume = val
		this.complete.audio.volume = val
		this.findExit.audio.volume = val
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
	constructor({explosionSize = 1, bombCount = 1, liveCount = 3, stages} = {}) {
		this.screen = new GameScreen()
		const error = this.checkArguments(explosionSize, bombCount, liveCount, stages)
		if (error) {
			this.error = error
			return
		}

		this.stageNumber = 0
		this.stages = stages
		const stage = stages[this.stageNumber]
		this.stage = new Stage({
			data: stage, bombCount, explosionSize
		})
		if (this.stage.error) {
			this.error = this.stage.error
			return
		}
		this.bomberman = new Bomberman({board: this.stage.board, liveCount})
		this.keyListener = new KeyListener()

		this.state = 'click-me'

		this.handleUserInteraction()
	}

	checkArguments = (explosionSize, bombCount, liveCount, stages) => {
		if (isNaN(explosionSize) || explosionSize < 1)
			return 'incorrect explosionSize'
		if (isNaN(bombCount) || bombCount < 1)
			return 'incorrect bombCount'
		if (isNaN(liveCount) || liveCount < 1)
			return 'incorrect liveCount'
		if (!(stages instanceof Array))
			return 'incorrect type of stages'
	}

	handleUserInteraction = () => {
		const clickListener = () => {
			this.sounds = new GameMusic()
			this.gameMenu = new GameMenu(this.sounds)
			this.state = 'pre-main-menu'
			document.querySelector('#click-me').remove()
			document.removeEventListener('click', clickListener)
		}
		document.addEventListener('click', clickListener)
	}

	isBombermanCollidedWithEnemies() {
		const {
			left, right, top, bottom
		} = this.bomberman.getBorders({own: true})
		for (const [, enemy] of this.stage.enemies) {
			const {
				left: eLeft, right: eRight, top: eTop, bottom: eBottom
			} = enemy.getBorders({own: true})
			if (!(top > eBottom || right < eLeft || left > eRight || bottom < eTop))
				return true
		}
	}

	isBombermanExploded() {
		const {
			left, right, top, bottom
		} = this.bomberman.getBorders({
			own: true, floorValues: true
		})
		const flamePass = this.bomberman.flamePass
		return this.stage.isExplosion(left, top, {flamePass}) ||
			this.stage.isExplosion(left, bottom, {flamePass}) ||
			this.stage.isExplosion(right, top, {flamePass}) ||
			this.stage.isExplosion(right, bottom, {flamePass})
	}

	handleBombermanDeath() {
		this.bomberman.die()
		this.state = 'pre-pre-die'
	}

	isBombermanCollidedWithExitDoor = () => {
		const {
			left, right, top, bottom
		} = this.bomberman.getBorders({
			own: true, floorValues: true
		})
		return this.stage.isExitDoor(left, top) || this.stage.isExitDoor(left, bottom) ||
			this.stage.isExitDoor(right, top) || this.stage.isExitDoor(right, bottom)
	}

	updateStage = () => {
		this.stageNumber++
		document.querySelector('#stage-start span').innerText = `${this.stageNumber + 1}`
	}

	cancelPowerUps = () => {
		for (const [, powerUp] of this.stage.consumedPowerUps) {
			switch (powerUp.type) {
				case 'bombs':
					this.stage.updateBombCountBy(-1)
					break
				case 'flames':
					this.stage.options.explosionSize--
					break
				case 'speed':
					this.bomberman.speed -= POWER_UP_SPEED_BOOST
					break
				case 'wall-pass':
					this.bomberman.wallPass = false
					break
				case 'detonator':
					this.bomberman.detonator = false
					break
				case 'bomb-pass':
					this.bomberman.bombPass = false
					break
				case 'flame-pass':
					this.bomberman.flamePass = false
					break
				case 'mystery':
					this.bomberman.invincibleTimer && this.bomberman.invincibleTimer.clear()
					this.bomberman.invincible = false
					break
			}
		}
		this.stage.consumedPowerUps.clear()
	}

	handleBombermanCollidedWithPowerUp = () => {
		const {
			left, right, top, bottom
		} = this.bomberman.getBorders({
			own: true, floorValues: true
		})
		let powerUp
		if (this.stage.isPowerUp(left, top) && !this.stage.isWall(left, top)) {
			powerUp = this.stage.getPowerUp(left, top)
		} else if (this.stage.isPowerUp(left, bottom) && !this.stage.isWall(left, bottom)) {
			powerUp = this.stage.getPowerUp(left, bottom)
		} else if (this.stage.isPowerUp(right, top) && !this.stage.isWall(right, top)) {
			powerUp = this.stage.getPowerUp(right, top)
		} else if (this.stage.isPowerUp(right, bottom) && !this.stage.isWall(right, bottom)) {
			powerUp = this.stage.getPowerUp(right, bottom)
		}
		if (powerUp) {
			playPowerUpPickedSound()
			switch (powerUp.type) {
				case 'bombs':
					this.stage.updateBombCountBy(1)
					break
				case 'flames':
					this.stage.options.explosionSize++
					break
				case 'speed':
					this.bomberman.speed += POWER_UP_SPEED_BOOST
					break
				case 'wall-pass':
					this.bomberman.wallPass = true
					break
				case 'detonator':
					this.bomberman.detonator = true
					break
				case 'bomb-pass':
					this.bomberman.bombPass = true
					break
				case 'flame-pass':
					this.bomberman.flamePass = true
					break
				case 'mystery':
					this.bomberman.invincibleTimer && this.bomberman.invincibleTimer.clear()
					this.bomberman.invincible = true
					this.bomberman.invincibleTimer = new Timer(() => {
						this.bomberman.invincible = false
					}, POWER_UP_INVINCIBLE_TIME)
					break
			}
			const id = createId(powerUp.x, powerUp.y)
			this.stage.consumedPowerUps.set(id, powerUp)
			this.stage.deletePowerUp(powerUp.x, powerUp.y)
		}
	}

	handleBombermanSurroundedWithBombs = (left, right, top, bottom) => {
		if (!this.stage.isBomb(left, top) && !this.stage.isBomb(left, bottom) && !this.stage.isBomb(right, top) &&
			!this.stage.isBomb(right, bottom))
			this.bomberman.isSurroundedWithBombs = false
	}

	handleBombermanMove = () => {
		const {
			left, right, top, bottom
		} = this.bomberman.getBorders({own: false})

		this.handleBombermanSurroundedWithBombs(Math.floor(left), Math.floor(right), Math.floor(top), Math.floor(bottom))

		let moved = false
		const isSurrounded = this.bomberman.isSurroundedWithBombs
		const bombPass = this.bomberman.bombPass || isSurrounded,
			wallPass = this.bomberman.wallPass

		if (this.keyListener.isPressed('KeyA') && !this.keyListener.isPressed('KeyD') &&
			!this.stage.isBlock(left, top + 0.05, {bombPass, wallPass}) &&
			!this.stage.isBlock(left, bottom - 0.05, {bombPass, wallPass})) {
			this.bomberman.moveLeft()
			moved = true
		}
		if (this.keyListener.isPressed('KeyD') && !this.keyListener.isPressed('KeyA') &&
			!this.stage.isBlock(right, top + 0.05, {bombPass, wallPass}) &&
			!this.stage.isBlock(right, bottom - 0.05, {bombPass, wallPass})) {
			this.bomberman.moveRight()
			moved = true
		}
		if (this.keyListener.isPressed('KeyW') && !this.keyListener.isPressed('KeyS') &&
			!this.stage.isBlock(left + 0.05, top, {bombPass, wallPass}) &&
			!this.stage.isBlock(right - 0.05, top, {bombPass, wallPass})) {
			this.bomberman.moveUp()
			moved = true
		}
		if (this.keyListener.isPressed('KeyS') && !this.keyListener.isPressed('KeyW') &&
			!this.stage.isBlock(left + 0.05, bottom, {bombPass, wallPass}) &&
			!this.stage.isBlock(right - 0.05, bottom, {bombPass, wallPass})) {
			this.bomberman.moveDown()
			moved = true
		}
		if (!moved)
			this.bomberman.img.className = `bomberman-look-${this.bomberman.direction}`
	}

	updateBomberman() {
		if (!this.bomberman.invincible && this.isBombermanCollidedWithEnemies()) {
			this.handleBombermanDeath()
			return
		}
		if (!this.bomberman.invincible && this.isBombermanExploded()) {
			this.handleBombermanDeath()
			return
		}
		if (this.stage.enemies.size <= 0 && this.isBombermanCollidedWithExitDoor()) {
			this.updateStage()
			this.state = 'pre-pre-stage-completed'
			return
		}
		this.handleBombermanCollidedWithPowerUp()
		this.handleBombermanMove()
	}

	isEnemyExploded(id) {
		const enemy = this.stage.enemies.get(id)
		const {
			left, right, top, bottom
		} = enemy.getBorders({floorValues: true})
		if (this.stage.isExplosion(left, top) || this.stage.isExplosion(left, bottom) || this.stage.isExplosion(right, top) || this.stage.isExplosion(right, bottom)) {
			this.stage.deleteEnemy(enemy.id)
			enemy.die()
			this.stage.options.score += enemy.xp
			if (this.stage.enemies.size <= 0) {
				this.state = 'find-exit'
			}
			return true
		}
		return false
	}

	updateEnemies = () => {
		for (const [enemyId] of this.stage.enemies)
			this.updateEnemy(enemyId)
	}

	moveEnemyRandomly(id) {
		const enemy = this.stage.enemies.get(id)
		if (!enemy.dead) {
			const {
				left, right, top, bottom
			} = enemy.getBorders({own: true})

			const wallPass = enemy.wallPass
			if (enemy.direction === 'left') {
				if (!this.stage.isBlock(left, top + 0.05, {wallPass, enemy: true}) &&
					!this.stage.isBlock(left, bottom - 0.05, {wallPass, enemy: true}))
					enemy.moveLeft()
				else
					enemy.direction = getRandomDirection(['right', 'up', 'down'])
				return
			}
			if (enemy.direction === 'right') {
				if (!this.stage.isBlock(right, top + 0.05, {wallPass, enemy: true}) &&
					!this.stage.isBlock(right, bottom - 0.05, {wallPass, enemy: true}))
					enemy.moveRight()
				else
					enemy.direction = getRandomDirection(['left', 'up', 'down'])
				return
			}
			if (enemy.direction === 'up') {
				if (!this.stage.isBlock(left + 0.05, top, {wallPass, enemy: true}) &&
					!this.stage.isBlock(right - 0.05, top, {wallPass, enemy: true}))
					enemy.moveUp()
				else
					enemy.direction = getRandomDirection(['left', 'right', 'down'])
				return
			}
			if (enemy.direction === 'down') {
				if (!this.stage.isBlock(left + 0.05, bottom, {wallPass, enemy: true}) &&
					!this.stage.isBlock(right - 0.05, bottom, {wallPass, enemy: true}))
					enemy.moveDown()
				else
					enemy.direction = getRandomDirection(['left', 'right', 'up'])
			}
		}
	}

	updateEnemy = id => {
		if (!this.isEnemyExploded(id))
			this.moveEnemyRandomly(id)
	}

	updateInstantBombs = () => {
		for (const bombId of this.stage.bombs.keys()) {
			const bomb = this.stage.bombs.get(bombId)
			if (bomb.instant) {
				bomb.instant = false
				bomb.timer.clear()
				bomb.timer = new Timer(() => {
					bomb.createExplosions()
					this.stage.deleteBomb(bomb.x, bomb.y)
				}, CHAIN_EXPLOSION_TIME)
				playExplosionSound()
			}
		}
	}

	updateBombs() {
		if (this.keyListener.isPressed('Space') && this.stage.options.bombCount) {
			const x = Math.floor((this.bomberman.left - 1 + (TILE_SIZE / 2)) / TILE_SIZE + 2),
				y = Math.floor((this.bomberman.top - 1 + (TILE_SIZE / 2)) / TILE_SIZE + 2)
			if (!this.stage.isBomb(x, y) && !this.stage.isExitDoor(x, y) && !this.stage.isWall(x, y)) {
				const bomb = new Bomb({
					board: this.stage.board, x, y, explosionSize: this.stage.options.explosionSize, stage: this.stage
				})
				this.bomberman.isSurroundedWithBombs = true
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
		for (const [, enemy] of this.stage.enemies)
			enemy.draw()
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

		this.addEventListeners()
	}

	addEventListeners = () => {
		document.addEventListener('keyup', e => {
			if (e.code === 'Escape') {
				if (this.state === 'stage') {
					this.state = 'pre-pause'
				} else if (this.state === 'pause') {
					this.state = 'pre-pre-resume'
				}
			} else if (e.code === 'KeyE' && this.bomberman.detonator) {
				if (this.stage.bombs.size > 0) {
					const bomb = this.stage.bombs.values().next().value
					this.stage.deleteBomb(bomb.x, bomb.y)
					bomb.createExplosions()
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
		for (const [, enemy] of this.stage.enemies) {
			enemy.img.className = `enemy-look-${enemy.direction}`
			enemy.timer && enemy.timer.pause()
		}
	}

	resumeEnemies = () => {
		for (const [, enemy] of this.stage.enemies)
			enemy.timer && enemy.timer.resume()
	}

	pauseBombs = () => {
		for (const bombId of this.stage.bombs.keys()) {
			const bomb = this.stage.bombs.get(bombId)
			bomb.timer && bomb.timer.pause()
			bomb.img.className = 'bomb-paused'
		}
	}

	resumeBombs = () => {
		for (const bombId of this.stage.bombs.keys()) {
			const bomb = this.stage.bombs.get(bombId)
			bomb.timer && bomb.timer.resume()
			bomb.img.className = 'bomb-exploding'
		}
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
				this.sounds.titleScreen.play()
				this.state = 'main-menu'
			} else if (this.state === 'main-menu' && this.keyListener.isPressed('Enter')) {
				this.state = 'initialize'
				this.sounds.titleScreen.stop()
			} else if (this.state === 'initialize') {
				this.screen.hideStage()
				this.initialize()
				this.state = 'pre-stage-start'
			} else if (this.state === 'pre-stage-start') {
				this.screen.stageStart.show()
				this.screen.hideStage()
				this.state = 'stage-start'
				this.sounds.stageStart.play()
				prevTime = currTime
			} else if (this.state === 'stage-start') {
				if (currTime - prevTime >= this.sounds.stageStart.durationMS()) {
					this.screen.stageStart.hide()
					this.screen.showStage()
					this.state = 'pre-stage'
				}
			} else if (this.state === 'pre-stage') {
				this.screen.showStage()
				this.sounds.stage.play()
				this.stage.options.initializeTimerChange()
				this.state = 'stage'
			} else if (this.state === 'stage') {
				// console.log(this.stage.options.roundTime)
				prevTime = currTime
				console.log(this.sounds.stage.audio.volume)
				this.update()
				this.draw()
			} else if (this.state === 'pre-pause') {
				this.sounds.stopStageMusic()
				this.sounds.pause.stop()
				this.sounds.pause.play()
				this.pause()
				this.state = 'pause'
			} else if (this.state === 'pause') {
				this.gameMenu.draw()
			} else if (this.state === 'pre-pre-resume') {
				prevTime = currTime
				this.sounds.pause.clear()
				this.state = 'pre-resume'
			} else if (this.state === 'pre-resume') {
				this.sounds.pause.stop()
				this.sounds.pause.play()
				this.gameMenu.hide()
				this.state = 'resume'
			} else if (this.state === 'resume') {
				if (currTime - prevTime >= this.sounds.pause.durationMS() / 2) {
					this.resume()
					this.state = 'pre-stage'
				}
			} else if (this.state === 'over') {
				this.sounds.stopStageMusic()
				this.sounds.over.play()
				this.screen.hideStage()
				this.screen.gameOver.showDisplay()
				this.state = 'game-over'
			} else if (this.state === 'pre-pre-die') {
				this.cancelPowerUps()
				this.sounds.stopStageMusic()
				this.pauseEnemies()
				this.sounds.die.play()
				this.state = 'pre-die'
			} else if (this.state === 'pre-die') {
				if (currTime - prevTime >= this.sounds.die.durationMS()) {
					this.sounds.die.stop()
					this.sounds.lifeLost.play()
					this.stage.options.score = this.stage.options.initialScore
					this.state = 'die'
				}
			} else if (this.state === 'die') {
				if (currTime - prevTime >= (this.sounds.die.durationMS() + this.sounds.lifeLost.durationMS())) {
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
				this.sounds.stage.stop()
				this.sounds.findExit.play()
				this.state = 'stage'
			} else if (this.state === 'pre-pre-stage-completed') {
				this.pauseBomberman()
				this.stage.consumedPowerUps.clear()
				this.sounds.stopStageMusic()
				this.sounds.complete.play()
				this.state = 'pre-stage-completed'
				ENEMY_ID = 0
				prevTime = currTime
			} else if (this.state === 'pre-stage-completed') {
				if (currTime - prevTime >= this.sounds.complete.durationMS()) {
					this.screen.hideStage()
					this.state = 'stage-completed'
				}
			} else if (this.state === 'stage-completed') {
				if (this.stageNumber < this.stages.length) {
					const stage = this.stages[this.stageNumber]
					this.stage.reinitialize(stage)
					this.bomberman.resetPosition()
					this.state = 'pre-stage-start'
				} else
					this.state = 'ending'
			} else if (this.state === 'ending') {
				this.screen.info.hide()
				this.screen.stage.hideDisplay()
				this.sounds.ending.play()
				this.screen.ending.showDisplay()
				this.state = 'END'
			}
		}
		requestAnimationFrame(callback)
	}
}

const game = new Game({
	bombCount: 100,
	stages: [
		{
			rows: 13, columns: 13,
			enemies: {ballom: 1},
			powerUps: {
				bombs: 1,
				flames: 1
			}
		},
		{
			rows: 13, columns: 31,
			enemies: {ballom: 4, onil: 4},
			powerUps: {flames: 1}
		}
		// {rows: 13, columns: 31, enemies: {ballom: 1}, powerUps: {'wall-pass': 1, 'bombs': 1, 'speed': 1}}
		// {enemies: {ballom: 3, onil: 3}}
		// {enemies: {ballom: 2, onil: 2, dahl: 2}}
	]
})
game.run()

// enemy types: ballom, onil, dahl, minvo
// power-ups: bombs, flames, speed, wall-pass, detonator, bomb-pass, flame-pass, mystery


// TODO:
// stage change: when initializing game just pass array of stages; a stage is 2d array of 0's and 1's; 0-nothing, 1-rock
// add enemies who can pass through wall
// add different enemy logic
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

// add transition to the start state after game-completed or game-over states
// add helper, which shows the keys to play the game

// OPTIMIZE, REMOVE FPS DROPS
