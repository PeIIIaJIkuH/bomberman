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

	getBorders(pixelSize, tileSize, {own = true} = {}) {
		let x = 0
		if (!own)
			x = 1
		let left = (this.left - x + (pixelSize + 1)) / tileSize + 2,
			right = (this.left - 1 + x + this.size - (pixelSize + 1)) / tileSize + 2,
			top = (this.top - x) / tileSize + 2,
			bottom = (this.top + x + this.size - (pixelSize - 1)) / tileSize + 2
		if (this instanceof Enemy) {
			left = (this.left - x) / tileSize + 2
			right = (this.left - 1 + x + this.size) / tileSize + 2
			bottom = (this.top + x + this.size) / tileSize + 2
		}
		return {left, right, top, bottom}
	}
}

class Enemy extends Entity {
	constructor({board, pixelSize, left, top, xp}) {
		super({board, pixelSize, left, top})
		this.speed /= 2
		this.direction = getRandomDirection()
		this.dead = false
		this.xp = xp

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
		this.timer = new Timer(() => {
			this.img.className = 'enemy-dead'
			this.div.remove()
		}, 1100)
	}
}

class Bomberman extends Entity {
	constructor({board, pixelSize, liveCount}) {
		super({board, pixelSize})
		this.direction = 'down'
		this.liveCount = liveCount
	}

	initialize = () => {
		this.createHTML()
	}

	createHTML = () => {
		this.div.id = 'bomberman'
		this.img.src = './img/bomberman.png'
		this.liveCountDiv = document.createElement('div')
		this.liveCountDiv.id = 'live-count'
		this.board.append(this.liveCountDiv)
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

class GameOptions {
	constructor({
		            rows, columns, pixelSize, tileSize, enemyCount, bombCount, explosionTime, explosionSize,
		            chainExplosionTime, roundTime
	            }) {
		this.rows = rows
		this.columns = columns
		this.pixelSize = pixelSize
		this.tileSize = tileSize
		this.enemyCount = enemyCount
		this.bombCount = bombCount
		this.explosionTime = explosionTime
		this.explosionSize = explosionSize
		this.chainExplosionTime = chainExplosionTime
		this.roundTime = roundTime
		this.passedTime = 0
		this.score = 0

		this.initialize()
	}

	initialize = () => {
		this.initializeTimer()
		this.initializeScore()
		this.initializeTimerChange()
	}

	draw = () => {
		this.drawTimer()
		this.drawScore()
	}

	drawScore = () => {
		this.scoreDiv.innerText = `${this.score}`
	}

	drawTimer = () => {
		this.timer.innerText = `LEFT: ${this.roundTime}`
	}

	initializeTimer = () => {
		this.timer = document.createElement('div')
		this.timer.id = 'timer'
		document.querySelector('#board').append(this.timer)
	}

	initializeScore = () => {
		this.scoreDiv = document.createElement('div')
		this.scoreDiv.id = 'score'
		document.querySelector('#board').append(this.scoreDiv)
	}

	initializeTimerChange = () => {
		const interval = setInterval(() => {
			this.roundTime--
			this.passedTime++
			if (this.roundTime <= 0)
				clearInterval(interval)
		}, 1000)

	}

	resetRoundTime = () => {
		this.roundTime += this.passedTime
		this.passedTime = 0
	}
}

class GameMap {
	constructor({
		            rows, columns, pixelSize, tileSize, enemyCount, bombCount, explosionTime, explosionSize,
		            chainExplosionTime, roundTime
	            }) {
		this.board = document.querySelector('#board')
		this.bombCount = bombCount
		this.options = new GameOptions({
			rows, columns, pixelSize, tileSize, enemyCount, bombCount, explosionSize, explosionTime, chainExplosionTime,
			roundTime
		})
		this.rocks = []
		this.walls = []
		this.enemies = []
		this.bombs = []
		this.explosions = []
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
		let sum = 0
		while (sum < this.options.enemyCount) {
			const x = getRandomInt(1, this.options.columns),
				y = getRandomInt(1, this.options.rows)
			if (!this.isBlock(x, y) && !(x <= 5 && y <= 5)) {
				const left = this.options.tileSize * (x - 2),
					top = this.options.tileSize * (y - 2)
				this.enemies.push(new Enemy({left, top, board: this.board, pixelSize: this.options.pixelSize, xp: 100}))
				sum++
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
	constructor({src, loop = false}) {
		this.audio = document.createElement('audio')
		this.audio.volume = 0.05
		this.audio.loop = loop
		this.audio.src = src
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
		this.titleScreen = new Music({src: './sounds/title-screen.mp3', loop: true})
		this.stageStart = new Music({src: './sounds/stage-start.mp3'})
		this.stage = new Music({src: './sounds/stage.mp3', loop: true})
		this.lifeLost = new Music({src: './sounds/life-lost.mp3'})
		this.ending = new Music({src: './sounds/ending.mp3'})
		this.over = new Music({src: './sounds/game-over.mp3'})
		this.complete = new Music({src: './sounds/stage-complete.mp3'})
		this.findExit = new Music({src: './sounds/find-exit.mp3', loop: true})
		this.pause = new Music({src: './sounds/pause.wav'})
		this.die = new Music({src: './sounds/die.wav'})
	}

	stopStageMusic = () => {
		this.stage.stop()
		this.findExit.stop()
	}
}

class Game {
	constructor({
		            rows = 13, columns = 31, pixelSize = 1, enemyCount = 5,
		            explosionTime = 2000, explosionSize = 1, bombCount = 1, liveCount = 3,
		            chainExplosionTime = 100, roundTime = 200
	            } = {}) {
		this.map = new GameMap({
			rows, columns, pixelSize, tileSize: 16 * pixelSize, enemyCount, bombCount, explosionTime, explosionSize,
			chainExplosionTime, roundTime
		})
		this.bomberman = new Bomberman({board: this.map.board, pixelSize, liveCount})
		this.keyListener = new KeyListener()
		this.menu = document.querySelector('#main-menu')
		this.gameMenu = new GameMenu()

		this.state = 'click-me'

		this.handleUserInteraction()
	}

	handleUserInteraction = () => {
		const clickListener = () => {
			this.music = new GameMusic()
			this.state = 'main-menu'
			document.querySelector('#click-me').remove()
			document.removeEventListener('click', clickListener)
		}
		document.addEventListener('click', clickListener)
	}

	isBombermanCollidedWithEnemies() {
		const {
			left, right, top, bottom
		} = this.bomberman.getBorders(this.map.options.pixelSize, this.map.options.tileSize, {own: true})
		for (let enemy of this.map.enemies) {
			const {
				left: eLeft, right: eRight, top: eTop, bottom: eBottom
			} = enemy.getBorders(this.map.options.pixelSize, this.map.options.tileSize, {own: true})
			if (!(top > eBottom || right < eLeft || left > eRight || bottom < eTop))
				return true
		}
	}

	isBombermanExploded() {
		const {
			left, right, top, bottom
		} = this.bomberman.getBorders(this.map.options.pixelSize, this.map.options.tileSize, {own: true})
		return this.map.isExplosion(left, top) || this.map.isExplosion(left, bottom) || this.map.isExplosion(right, top) || this.map.isExplosion(right, bottom)
	}

	handleBombermanDeath() {
		this.bomberman.die()
		this.state = 'pre-pre-die'
	}

	isBombermanCollidedWithExitDoor = () => {
		const {
			left, right, top, bottom
		} = this.bomberman.getBorders(this.map.options.pixelSize, this.map.options.tileSize, {own: true})
		return this.map.isExitDoor(left, top) || this.map.isExitDoor(left, bottom) || this.map.isExitDoor(right, top) || this.map.isExitDoor(right, bottom)
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

		if (!this.map.enemies.length && this.isBombermanCollidedWithExitDoor()) {
			this.state = 'won'
			return
		}

		const {
			left, right, top, bottom
		} = this.bomberman.getBorders(this.map.options.pixelSize, this.map.options.tileSize, {own: false})

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

	handleEnemyExplosion(enemy) {
		const {
			left, right, top, bottom
		} = enemy.getBorders(this.map.options.pixelSize, this.map.options.tileSize)
		if (this.map.isExplosion(left, top) || this.map.isExplosion(left, bottom) || this.map.isExplosion(right, top) || this.map.isExplosion(right, bottom)) {
			this.map.deleteEnemy(enemy)
			enemy.die()
			this.map.options.score += enemy.xp
			if (!this.map.enemies.length) {
				this.state = 'find-exit'
			}
		}
	}

	updateEnemies = () => {
		this.map.enemies.forEach(enemy => {
			this.updateEnemy(enemy)
		})
	}

	moveEnemyRandomly(enemy) {
		if (!enemy.dead) {
			const {
				left, right, top, bottom
			} = enemy.getBorders(this.map.options.pixelSize, this.map.options.tileSize, {own: true})

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

	updateEnemy = enemy => {
		this.handleEnemyExplosion(enemy)
		this.moveEnemyRandomly(enemy)
	}

	updateInstantBombs = () => {
		this.map.bombs.forEach(bomb => {
			if (bomb.instant) {
				bomb.instant = false
				bomb.timer.clear()
				bomb.timer = new Timer(() => {
					bomb.createExplosions()
					this.map.deleteBomb(bomb.x, bomb.y)
				}, this.map.options.chainExplosionTime)
				playExplosionSound()
			}
		})
	}

	updateBombs = () => {
		if (this.keyListener.isPressed('Space') && this.map.options.bombCount) {
			const x = Math.floor((this.bomberman.left - 1 + (this.map.options.tileSize / 2)) / this.map.options.tileSize + 2),
				y = Math.floor((this.bomberman.top - 1 + (this.map.options.tileSize / 2)) / this.map.options.tileSize + 2)
			if (!this.map.isBomb(x, y)) {
				const bomb = new Bomb({
					board: this.map.board, x, y, explosionSize: this.map.options.explosionSize, map: this.map
				})
				this.map.addBomb(bomb)
				playBombLeaveSound()
			}
		}
		this.updateInstantBombs()
	}

	update() {
		this.updateBombs()
		this.updateBomberman()
		this.updateEnemies()

		if (this.map.options.roundTime === 0) {
			this.handleBombermanDeath()
			this.state = 'pre-pre-die'
		}
	}

	drawEnemies = () => {
		this.map.enemies.forEach(enemy => {
			enemy.draw()
		})
	}

	draw = () => {
		this.bomberman.draw()
		this.bomberman.liveCountDiv.innerText = `LEFT: ${this.bomberman.liveCount}`
		this.drawEnemies()
		this.map.options.draw()
	}

	initialize = () => {
		this.menu.style.display = 'none'
		this.map.initialize()
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
		this.map.enemies.forEach(enemy => {
			enemy.img.className = `enemy-look-${enemy.direction}`
			enemy.timer && enemy.timer.pause()
		})
	}

	resumeEnemies = () => {
		this.map.enemies.forEach(enemy => {
			enemy.timer && enemy.timer.resume()
		})
	}

	pauseBombs = () => {
		this.map.bombs.forEach(bomb => {
			bomb.timer && bomb.timer.pause()
			bomb.img.className = 'bomb-paused'
		})
	}

	resumeBombs = () => {
		this.map.bombs.forEach(bomb => {
			bomb.timer && bomb.timer.resume()
			bomb.img.className = 'bomb-exploding'
		})
	}

	restart = () => {
		this.map.restart()
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
			console.log(this.state)
			requestAnimationFrame(callback)

			if (this.state === 'main-menu' && this.keyListener.isPressed('Enter')) {
				this.state = 'initialize'
				this.music.titleScreen.stop()
			} else if (this.state === 'main-menu') {
				prevTime = currTime
				this.music.titleScreen.play()
			} else if (this.state === 'initialize') {
				this.map.board.style.opacity = '0'
				this.initialize()
				this.state = 'stage-start-show'
			} else if (this.state === 'stage-start-show') {
				document.querySelector('#pre-level').className = 'stage-start-show'
				this.map.board.style.opacity = '0'
				this.state = 'stage-start'
				this.music.stageStart.play()
			} else if (this.state === 'stage-start') {
				if (currTime - prevTime >= this.music.stageStart.durationMS()) {
					document.querySelector('#pre-level').className = 'pre-level-hide'
					this.map.board.style.opacity = '1'
					this.state = 'pre-stage'
				}
			} else if (this.state === 'pre-stage') {
				this.map.board.style.opacity = '1'
				this.music.stage.play()
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
				document.querySelector('#game-over').className = 'game-over-show'
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
					this.state = 'die'
				}
			} else if (this.state === 'die') {
				if (currTime - prevTime >= (this.music.die.durationMS() + this.music.lifeLost.durationMS())) {
					prevTime = currTime
					if (this.bomberman.liveCount) {
						this.state = 'restart'
						this.map.options.resetRoundTime()
					} else
						this.state = 'over'
				}
			} else if (this.state === 'restart') {
				this.restart()
				this.state = 'stage-start-show'
			} else if (this.state === 'find-exit') {
				this.music.stage.stop()
				this.music.findExit.play()
				this.state = 'stage'
			} else if (this.state === 'won') {
				this.pauseBomberman()
				this.music.stopStageMusic()
				this.music.complete.play()
				if (currTime - prevTime >= this.music.complete.durationMS()) {
					this.state = 'ending'
				}
			} else if (this.state === 'ending') {
				this.map.board.remove()
				this.music.ending.play()
				document.querySelector('#ending').style.display = 'block'
				this.state = 'END'
			}
		}
		requestAnimationFrame(callback)
	}
}

const game = new Game({
	pixelSize: 2
})

game.run()

window.game = game

// TODO:
// bonuses, show score after enemy death, stage change, different enemies