import {Bomb} from './game/entities/bomberman/bomb.js'
import {Bomberman} from './game/entities/bomberman/bomberman.js'
import {GameMenu} from './game/gameMenu/gameMenu.js'
import {GameScreen} from './game/gameScreen/gameScreen.js'
import {GameSounds} from './game/gameSounds/gameSounds.js'
import {GameStage} from './game/gameStage/gameStage.js'
import {
	CHAIN_EXPLOSION_TIME,
	DEFAULT_COLUMNS,
	DEFAULT_ROUND_TIME,
	DEFAULT_ROWS,
	ENEMY_TYPES,
	GAME_MENU_CONTINUE,
	GAME_MENU_MAIN_MENU,
	GAME_MENU_RESTART_GAME,
	GAME_MENU_RESTART_STAGE,
	PIXEL_SIZE,
	POWER_UP_INVINCIBLE_TIME,
	POWER_UP_SPEED_BOOST,
	POWER_UP_TYPES,
	resetEnemyId,
	TILE_SIZE,
	TILES
} from './utils/constants.js'
import {changeTitle, createId, getRandomDirection, isRectangle, powerUpsCount, tileCount} from './utils/helpers.js'
import {KeyListener} from './utils/keyListener.js'
import {playBombLeaveSound, playExplosionSound, playPowerUpPickedSound} from './utils/sounds.js'
import {Timer} from './utils/timers/timer.js'

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
		this.stage = new GameStage({
			data: stages[this.stageNumber], bombCount, explosionSize
		})
		if (this.stage.error) {
			this.error = this.stage.error
			return
		}
		this.bomberman = new Bomberman({board: this.stage.board, liveCount})
		this.keyListener = new KeyListener()

		changeTitle('Activate the Game | Bomberman')
		this.completed = false
		this.state = 'click-me'

		this.initialBombCount = bombCount
		this.initialLiveCount = liveCount
		this.initialExplosionSize = explosionSize

		this.handleUserInteraction()
	}

	checkArguments = (explosionSize, bombCount, liveCount, stages) => {
		if (isNaN(explosionSize) || explosionSize < 1)
			return `incorrect explosionSize: ${String(explosionSize)}`
		if (isNaN(bombCount) || bombCount < 1)
			return `incorrect bombCount: ${String(bombCount)}`
		if (isNaN(liveCount) || liveCount < 1)
			return `incorrect liveCount: ${String(liveCount)}`
		if (!(stages instanceof Array))
			return `incorrect stages: ${String(stages)}`
		for (let i = 0; i < stages.length; i++) {
			const stage = stages[i]
			if (!(stage instanceof Object))
				return `incorrect stage(${i + 1}): ${String(stage)}`
			const rows = stage.rows || DEFAULT_ROWS,
				columns = stage.columns || DEFAULT_COLUMNS,
				roundTime = stage.roundTime || DEFAULT_ROUND_TIME,
				enemies = stage.enemies || {},
				powerUps = stage.powerUps || {},
				map = stage.map
			let error = this.checkStageArguments(rows, columns, roundTime, enemies, powerUps, i)
			if (map)
				error = this.checkMap(map, powerUps, i)
			if (error)
				return error
		}
	}

	checkMap = (map, powerUps, i) => {
		if (!isRectangle(map) || map[0][0] !== TILES.EMPTY)
			return `incorrect stage map: ${i + 1}`
		const wallCount = tileCount(map, TILES.WALL),
			powerUpCount = powerUpsCount(powerUps)
		if (wallCount < powerUpCount + 1)
			return `incorrect stage(${i + 1}) wall count: ${wallCount}`
	}

	checkStageArguments = (rows, columns, roundTime, enemies, powerUps, index) => {
		if (isNaN(rows) || rows < 7)
			return `incorrect stage(${index + 1}) rows: ${String(rows)}`
		if (isNaN(columns) || columns < 7)
			return `incorrect stage(${index + 1}) columns: ${String(columns)}`
		if (isNaN(roundTime) || roundTime < 10)
			return `incorrect stage(${index + 1}) roundTime: ${String(roundTime)}`
		if (!(enemies instanceof Object))
			return `incorrect stage(${index + 1}) enemies: ${String(enemies)}`
		if (enemies)
			for (const enemyType of Object.keys(enemies)) {
				if (!ENEMY_TYPES.includes(enemyType))
					return `incorrect stage(${index + 1}) enemy: ${enemyType}`
				if (isNaN(enemies[enemyType]) || enemies[enemyType] < 1)
					return `incorrect stage(${index + 1}) enemy(${enemyType}) count: ${String(enemies[enemyType])}`
			}
		if (powerUps !== undefined && !(powerUps instanceof Object))
			return `incorrect stage(${index + 1}) powerUps: ${String(powerUps)}`
		if (powerUps)
			for (const powerUpType of Object.keys(powerUps)) {
				if (!POWER_UP_TYPES.includes(powerUpType))
					return `incorrect stage(${index + 1}) powerUp: ${String(powerUpType)}`
				if (isNaN(powerUps[powerUpType]) || powerUps[powerUpType] < 1)
					return `incorrect stage(${index + 1}) powerUp(${powerUpType}) count: ${String(powerUps[powerUpType])}`
			}
	}

	handleUserInteraction = () => {
		const clickListener = () => {
			this.sounds = new GameSounds()
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

	resetStageNumber = () => {
		this.stageNumber = 0
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

	handleBombermanMove = (diff) => {
		const {
			left, right, top, bottom
		} = this.bomberman.getBorders({own: false})

		const fix = diff * 100

		this.handleBombermanSurroundedWithBombs(Math.floor(left), Math.floor(right), Math.floor(top), Math.floor(bottom))

		let moved = false
		const isSurrounded = this.bomberman.isSurroundedWithBombs
		const bombPass = this.bomberman.bombPass || isSurrounded,
			wallPass = this.bomberman.wallPass

		for (let i = this.bomberman.speed; i > 0; i -= 0.25)
			if (this.keyListener.isPressed('KeyA') && !this.keyListener.isPressed('KeyD') &&
				!this.stage.isBlock(left - (i * fix / TILE_SIZE), top, {bombPass, wallPass}) &&
				!this.stage.isBlock(left - (i * fix / TILE_SIZE), bottom, {bombPass, wallPass})) {
				this.bomberman.moveLeft(i * fix)
				moved = true
				break
			}
		for (let i = this.bomberman.speed; i > 0; i -= 0.25)
			if (this.keyListener.isPressed('KeyD') && !this.keyListener.isPressed('KeyA') &&
				!this.stage.isBlock(right + (i * fix / TILE_SIZE), top, {bombPass, wallPass}) &&
				!this.stage.isBlock(right + (i * fix / TILE_SIZE), bottom, {bombPass, wallPass})) {
				this.bomberman.moveRight(i * fix)
				moved = true
				break
			}
		for (let i = this.bomberman.speed; i > 0; i -= 0.25)
			if (this.keyListener.isPressed('KeyW') && !this.keyListener.isPressed('KeyS') &&
				!this.stage.isBlock(left, top - (i * fix / TILE_SIZE), {bombPass, wallPass}) &&
				!this.stage.isBlock(right, top - (i * fix / TILE_SIZE), {bombPass, wallPass})) {
				this.bomberman.moveUp(i * fix)
				moved = true
				break
			}
		for (let i = this.bomberman.speed; i > 0; i -= 0.25)
			if (this.keyListener.isPressed('KeyS') && !this.keyListener.isPressed('KeyW') &&
				!this.stage.isBlock(left, bottom + (i * fix / TILE_SIZE), {bombPass, wallPass}) &&
				!this.stage.isBlock(right, bottom + (i * fix / TILE_SIZE), {bombPass, wallPass})) {
				this.bomberman.moveDown(i * fix)
				moved = true
				break
			}
		if (!moved)
			this.bomberman.img.className = `bomberman-look-${this.bomberman.direction}`
	}

	moveEnemyRandomly(id, diff) {
		const enemy = this.stage.enemies.get(id)
		if (!enemy.dead) {
			const {
				left, right, top, bottom
			} = enemy.getBorders({own: true})

			const fix = diff * 100

			const wallPass = enemy.wallPass
			if (enemy.direction === 'left') {
				let moved = false
				for (let i = enemy.speed; i > 0; i -= 0.25)
					if (!this.stage.isBlock(left - (i * fix / TILE_SIZE), top, {wallPass, enemy: true}) &&
						!this.stage.isBlock(left - (i * fix / TILE_SIZE), bottom, {wallPass, enemy: true})) {
						enemy.moveLeft(i * fix)
						moved = true
						break
					}
				if (!moved)
					enemy.direction = getRandomDirection(['right', 'up', 'down'])
				return
			}
			if (enemy.direction === 'right') {
				let moved = false
				for (let i = enemy.speed; i > 0; i -= 0.25)
					if (!this.stage.isBlock(right + (i * fix / TILE_SIZE), top, {wallPass, enemy: true}) &&
						!this.stage.isBlock(right + (i * fix / TILE_SIZE), bottom, {wallPass, enemy: true})) {
						enemy.moveRight(i * fix)
						moved = true
						break
					}
				if (!moved)
					enemy.direction = getRandomDirection(['left', 'up', 'down'])
				return
			}
			if (enemy.direction === 'up') {
				let moved = false
				for (let i = enemy.speed; i > 0; i -= 0.25)
					if (!this.stage.isBlock(left, top - (i * fix / TILE_SIZE), {wallPass, enemy: true}) &&
						!this.stage.isBlock(right, top - (i * fix / TILE_SIZE), {wallPass, enemy: true})) {
						enemy.moveUp(i * fix)
						moved = true
						break
					}
				if (!moved)
					enemy.direction = getRandomDirection(['left', 'right', 'down'])
				return
			}
			if (enemy.direction === 'down') {
				let moved = false
				for (let i = enemy.speed; i > 0; i -= 0.25)
					if (!this.stage.isBlock(left, bottom + (i * fix / TILE_SIZE), {wallPass, enemy: true}) &&
						!this.stage.isBlock(right, bottom + (i * fix / TILE_SIZE), {wallPass, enemy: true})) {
						enemy.moveDown(i * fix)
						moved = true
						break
					}
				if (!moved)
					enemy.direction = getRandomDirection(['left', 'right', 'up'])
			}
		}
	}

	updateBomberman(diff) {
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
		this.handleBombermanMove(diff)
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

	updateEnemies = (diff) => {
		for (const [enemyId] of this.stage.enemies)
			this.updateEnemy(enemyId, diff)
	}

	updateEnemy = (id, diff) => {
		if (!this.isEnemyExploded(id))
			this.moveEnemyRandomly(id, diff)
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

	update(diff) {
		this.updateBombs()
		this.updateBomberman(diff)
		this.updateEnemies(diff)

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
					this.state = 'pre-resume'
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

	restartStage = () => {
		this.cancelPowerUps()
		this.stage.restart()
		this.bomberman.resetPosition()
	}

	restartGame = () => {
		this.resetStageNumber()
		const stage = this.stages[this.stageNumber]
		this.stage.reinitialize(stage)
		this.stage.options.score = 0
		this.stage.options.bombCount = this.initialBombCount
		this.stage.options.explosionSize = this.initialExplosionSize
		this.bomberman.resetPosition()
		this.bomberman.left = 2 * PIXEL_SIZE
		this.bomberman.top = 2 * PIXEL_SIZE
		this.bomberman.direction = 'down'
		this.bomberman.liveCount = this.initialLiveCount
		this.bomberman.bombPass = false
		this.bomberman.flamePass = false
		this.bomberman.detonator = false
		this.bomberman.invincible = false
		this.bomberman.isSurroundedWithBombs = false
		this.bomberman.speed = 1
		this.gameMenu.hide()
	}

	gameMenuListener = e => {
		if (e.code === 'Enter') {
			if (this.gameMenu.selected === GAME_MENU_CONTINUE) {
				this.state = 'pre-resume'
			} else if (this.gameMenu.selected === GAME_MENU_RESTART_STAGE) {
				this.bomberman.liveCount += this.stage.options.deathCount
				this.restartStage()
				this.state = 'pre-resume'
			} else if (this.gameMenu.selected === GAME_MENU_RESTART_GAME) {
				this.restartGame()
				this.state = 'pre-stage-start'
			} else if (this.gameMenu.selected === GAME_MENU_MAIN_MENU) {
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
		let prevTime = 0,
			prevFPSTime = 0
		const callback = (currTime) => {
			requestAnimationFrame(callback)

			if (this.error) {
				document.querySelector('#incorrect-arguments').textContent = this.error
				this.screen.incorrectArguments.showDisplay()
				changeTitle('Incorrect arguments | Bomberman')
				this.state = 'INCORRECT-ARGUMENTS'
			}

			if (this.state === 'pre-main-menu') {
				changeTitle('Main Menu | Bomberman')
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
				changeTitle(`Stage ${this.stageNumber + 1} Start | Bomberman`)
				this.screen.stageStart.show()
				this.screen.hideStage()
				this.state = 'stage-start'
				this.sounds.stageStart.play()
				prevTime = currTime
			} else if (this.state === 'stage-start') {
				if (currTime - prevTime >= this.sounds.stageStart.durationMS()) {
					this.screen.stageStart.hide()
					this.screen.showStage()
					this.state = 'initialize-timer'
				}
			} else if (this.state === 'initialize-timer') {
				this.stage.options.initializeTimerChange()
				this.state = 'pre-stage'
			} else if (this.state === 'pre-stage') {
				changeTitle(`Stage ${this.stageNumber + 1} | Bomberman`)
				this.screen.showStage()
				this.sounds.stage.play()
				this.state = 'stage'
			} else if (this.state === 'stage') {
				prevTime = currTime
				const diff = (currTime - prevFPSTime) / 1000
				this.update(diff)
				this.draw()
			} else if (this.state === 'pre-pause') {
				changeTitle('Paused | Bomberman')
				this.stage.options.interval.clear()
				this.sounds.stopStageMusic()
				this.sounds.pause.stop()
				this.sounds.pause.play()
				this.pause()
				this.state = 'pause'
			} else if (this.state === 'pause') {
				this.gameMenu.draw()
			} else if (this.state === 'pre-resume') {
				this.sounds.pause.stop()
				this.sounds.pause.play()
				this.gameMenu.hide()
				this.stage.options.interval.resume()
				this.state = 'resume'
			} else if (this.state === 'resume') {
				changeTitle(`Stage ${this.stageNumber + 1} | Bomberman`)
				this.resume()
				this.state = 'pre-stage'
			} else if (this.state === 'over') {
				this.sounds.stopStageMusic()
				this.sounds.over.play()
				this.screen.hideStage()
				this.screen.gameOver.showDisplay()
				changeTitle('Game Over | Bomberman')
				this.state = 'GAME-OVER'
			} else if (this.state === 'pre-pre-die') {
				this.cancelPowerUps()
				this.sounds.stopStageMusic()
				this.pauseEnemies()
				this.pauseBombs()
				this.sounds.die.play()
				this.stage.options.deathCount++
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
					if (this.bomberman.liveCount > 0)
						this.state = 'restart'
					else
						this.state = 'pre-game-score'
				}
			} else if (this.state === 'restart') {
				this.restartStage()
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
				resetEnemyId()
				prevTime = currTime
			} else if (this.state === 'pre-stage-completed') {
				if (currTime - prevTime >= this.sounds.complete.durationMS()) {
					this.screen.hideStage()
					changeTitle(`Stage ${this.stageNumber + 1} Completed | Bomberman`)
					this.state = 'stage-completed'
				}
			} else if (this.state === 'stage-completed') {
				if (this.stageNumber < this.stages.length) {
					const stage = this.stages[this.stageNumber]
					this.stage.reinitialize(stage)
					this.bomberman.resetPosition()
					this.state = 'pre-stage-start'
				} else {
					this.completed = true
					this.state = 'pre-game-score'
				}
			} else if (this.state === 'pre-game-score') {
				changeTitle(`Stage ${this.stageNumber + 1} Start | Bomberman`)
				this.screen.hideStage()
				this.screen.setGameScore(this.stage.options.score)
				this.screen.gameScore.show()
				prevTime = currTime
				changeTitle('Final Score | Bomberman')
				this.state = 'game-score'
			} else if (this.state === 'game-score') {
				if (currTime - prevTime >= 5000) {
					this.screen.gameScore.hide()
					if (this.completed)
						this.state = 'ending'
					else
						this.state = 'over'
				}
			} else if (this.state === 'ending') {
				changeTitle('Game End | Bomberman')
				this.screen.info.hide()
				this.screen.stage.hideDisplay()
				this.sounds.ending.play()
				this.screen.ending.showDisplay()
				this.state = 'END'
			}
			prevFPSTime = currTime
		}
		requestAnimationFrame(callback)
	}
}


// enemy types: balloom, oneal, doll, minvo, kondoria, ovapi, pass, pontan
// power-ups: bombs, flames, speed, wall-pass, detonator, bomb-pass, flame-pass, mystery

const _ = TILES.EMPTY,
	r = TILES.ROCK,
	w = TILES.WALL

const defaultGames = {
	easy: [
		{
			rows: 15, columns: 15,
			enemies: {balloom: 2, oneal: 2},
			powerUps: {bombs: 1, 'bomb-pass': 1, 'wall-pass': 1}
		}, {
			rows: 15, columns: 15,
			enemies: {doll: 2, minvo: 2},
			powerUps: {flames: 1, detonator: 1, 'flame-pass': 1}
		}, {
			rows: 15, columns: 15,
			enemies: {kondoria: 2, ovapi: 2},
			powerUps: {speed: 1}
		}, {
			rows: 15, columns: 15,
			enemies: {pass: 2, pontan: 2},
			powerUps: {mystery: 1}
		}
	],
	differentMaps: [
		{
			enemies: {balloom: 3, oneal: 3},
			powerUps: {bombs: 1, flames: 1, detonator: 1},
			map: [
				[_, _, _, _, _, w, _, _, _, _, _, w, _, _, _, w, _, w, _, _, w, _, w, _, _, _, _, _, _],
				[_, r, w, r, _, r, _, r, _, r, w, r, w, r, _, r, _, r, w, r, _, r, _, r, w, r, _, r, _],
				[_, _, w, _, _, _, w, _, _, w, _, _, _, w, _, w, _, _, _, _, _, _, _, _, _, _, _, _, _],
				[_, r, _, r, w, r, _, r, w, r, _, r, _, r, _, r, _, r, _, r, w, r, _, r, _, r, _, r, _],
				[_, _, w, w, w, _, w, _, _, _, _, _, _, _, _, w, _, _, _, _, _, _, _, _, _, _, _, _, _],
				[_, r, _, r, _, r, _, r, _, r, _, r, _, r, _, r, _, r, _, r, _, r, _, r, _, r, _, r, w],
				[_, _, _, _, _, _, _, _, _, _, w, _, _, w, _, _, w, _, _, _, _, w, _, _, _, _, _, _, _],
				[_, r, w, r, w, r, _, r, _, r, _, r, _, r, _, r, _, r, _, r, _, r, _, r, _, r, w, r, _],
				[w, _, _, _, _, _, w, _, _, _, _, _, _, _, w, _, _, _, _, _, _, w, _, _, _, _, w, w, _],
				[_, r, w, r, _, r, _, r, _, r, _, r, _, r, _, r, w, r, _, r, _, r, _, r, _, r, _, r, _],
				[w, _, _, _, _, _, _, w, w, _, w, _, w, _, w, _, w, _, _, _, _, _, _, _, _, _, _, _, _]
			]
		}, {
			roundTime: 300,
			enemies: {doll: 2, minvo: 2, kondoria: 2},
			powerUps: {'flame-pass': 1, 'wall-pass': 1, 'bomb-pass': 1},
			map: [
				[_, _, _, _, w, _, _, w, _, _, w, _, _, w, _, _, w, _, _, w, _, _, w, _, _, w, _, _, w],
				[r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, _],
				[_, _, w, _, _, w, _, _, w, _, _, w, _, _, w, _, _, w, _, _, w, _, _, w, _, _, w, r, _],
				[w, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, _, r, w],
				[_, r, w, _, _, w, _, _, w, _, _, w, _, _, w, _, _, w, _, _, w, _, _, w, _, r, _, r, _],
				[_, r, _, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, _, r, w, r, _],
				[w, r, _, r, _, _, w, _, _, w, _, _, w, _, _, w, _, _, w, _, _, w, _, _, w, r, _, r, w],
				[_, r, w, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, _, r, _],
				[_, r, _, _, w, _, _, w, _, _, w, _, _, w, _, _, _, w, _, _, w, _, _, w, _, _, w, r, _],
				[w, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, w],
				[_, _, w, _, _, w, _, _, w, _, _, w, _, _, w, _, _, w, _, _, w, _, _, w, _, _, w, _, _]
			]
		}, {
			roundTime: 300,
			enemies: {ovapi: 2, pass: 2, pontan: 2},
			powerUps: {speed: 1, mystery: 1, bombs: 1, flames: 1},
			map: [
				[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
				[_, r, r, r, r, r, r, _, r, r, r, r, r, r, r, r, r, r, r, r, _, r, r, r, r, r, r, r, _],
				[_, r, _, w, _, _, _, w, _, _, _, w, _, _, r, _, w, _, _, _, w, _, _, _, w, _, _, r, _],
				[_, r, _, w, _, w, _, w, _, w, _, w, _, w, r, _, w, _, w, _, w, _, w, _, w, _, w, r, _],
				[_, r, _, _, _, w, _, _, _, w, _, _, _, w, r, _, _, _, w, _, _, _, w, _, _, _, w, r, _],
				[_, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, r, _],
				[_, r, _, w, _, _, _, w, _, _, _, w, _, _, r, _, w, _, _, _, w, _, _, _, w, _, _, r, _],
				[_, r, _, w, _, w, _, w, _, w, _, w, _, w, r, _, w, _, w, _, w, _, w, _, w, _, w, r, _],
				[_, r, _, _, _, w, _, _, _, w, _, _, _, w, r, _, _, _, w, _, _, _, w, _, _, _, w, r, _],
				[_, r, r, r, r, r, r, _, r, r, r, r, r, r, r, r, r, r, r, r, _, r, r, r, r, r, r, r, _],
				[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _]
			]
		}
	]
}

const game = new Game({
	stages: defaultGames.differentMaps
})
game.run()

window.game = game


// TODO:
// add different enemy logic by levels: 1, 2, 3
// add backend:
//          add page, where user can write his nickname and send his score to the backend
//          add page, where user can see scores of the other players, from highest to the lowest
// add responsive design: just change PIXEL_SIZE

// add animation to the last page

// add helper, which shows the keys to play the game

// OPTIMIZE, REMOVE FPS DROPS

// restart must clear powerups and liveCount
