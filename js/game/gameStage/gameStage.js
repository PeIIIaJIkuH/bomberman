import {DEFAULT_COLUMNS, DEFAULT_ROWS, TILE_SIZE} from '../../utils/constants.js'
import {createId, getRandomInt} from '../../utils/helpers.js'
import {ExitDoor} from '../blocks/exitDoor.js'
import {PowerUp} from '../blocks/powerUp.js'
import {Rock} from '../blocks/rock.js'
import {Wall} from '../blocks/wall.js'
import {Enemy} from '../entities/enemy/enemy.js'
import {GameStageOptions} from './gameStageOptions.js'

export class GameStage {
	constructor({data, bombCount, explosionSize}) {
		const rows = data.rows || DEFAULT_ROWS,
			columns = data.columns || DEFAULT_COLUMNS,
			roundTime = data.roundTime || 200,
			enemies = data.enemies || {},
			powerUps = data.powerUps || {}

		this.board = document.querySelector('#board')
		this.bombCount = bombCount
		this.options = new GameStageOptions({
			rows, columns, enemies, bombCount, powerUps,
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

	reinitialize = data => {
		this.removeAllDivs()
		const rows = data.rows || DEFAULT_ROWS,
			columns = data.columns || DEFAULT_COLUMNS,
			roundTime = data.roundTime || 200,
			enemies = data.enemies,
			powerUps = data.powerUps || {}
		const {bombCount, explosionSize, score} = this.options
		this.options = new GameStageOptions({
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
		this.removeMapElements('bombs')
		this.removeExplosions()
		this.exitDoor.div.remove()
	}

	restart = () => {
		this.options.resetRoundTime()
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