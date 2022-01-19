import {createEnemyId, DIRECTIONS, DURATIONS, PIXEL_SIZE} from '../../../utils/constants.js'
import {getRandomDirection} from '../../../utils/helpers.js'
import {Timer} from '../../../utils/timers/timer.js'
import {Entity} from '../entity.js'
import {EnemyXP} from './enemyXP.js'

export class Enemy extends Entity {
	constructor({board, left, top, xp, type}) {
		super({board, left, top})
		this.id = createEnemyId()
		this.direction = getRandomDirection()
		this.dead = false
		this.xp = xp
		this.type = type

		this.handleType()
	}

	handleType = () => {
		switch (this.type) {
			case 'balloom':
				if (this.xp !== 0) this.xp = 100
				this.speed = PIXEL_SIZE / 4
				this.createHTML('./assets/img/enemies/balloom.png')
				break
			case 'oneal':
				if (this.xp !== 0) this.xp = 200
				this.speed = PIXEL_SIZE / 2
				this.createHTML('./assets/img/enemies/oneal.png')
				break
			case 'doll':
				if (this.xp !== 0) this.xp = 400
				this.speed = 5 * PIXEL_SIZE / 8
				this.createHTML('./assets/img/enemies/doll.png')
				break
			case 'minvo':
				if (this.xp !== 0) this.xp = 800
				this.speed = 3 * PIXEL_SIZE / 4
				this.createHTML('./assets/img/enemies/minvo.png')
				break
			case 'kondoria':
				if (this.xp !== 0) this.xp = 1000
				this.speed = PIXEL_SIZE / 8
				this.wallPass = true
				this.createHTML('./assets/img/enemies/kondoria.png')
				break
			case 'ovapi':
				if (this.xp !== 0) this.xp = 2000
				this.speed = PIXEL_SIZE / 4
				this.wallPass = true
				this.createHTML('./assets/img/enemies/ovapi.png')
				break
			case 'pass':
				if (this.xp !== 0) this.xp = 4000
				this.speed = 3 * PIXEL_SIZE / 4
				this.createHTML('./assets/img/enemies/pass.png')
				break
			case 'pontan':
				if (this.xp !== 0) this.xp = 8000
				this.speed = 3 * PIXEL_SIZE / 4
				this.wallPass = true
				this.createHTML('./assets/img/enemies/pontan.png')
				break
		}
	}

	createHTML = src => {
		this.div.className = 'enemy'
		this.img.src = src
	}

	moveLeft(speed) {
		super.moveLeft(speed)
		this.direction = DIRECTIONS.LEFT
		this.img.className = 'enemy-walk-left'
	}

	moveRight(speed) {
		super.moveRight(speed)
		this.direction = DIRECTIONS.RIGHT
		this.img.className = 'enemy-walk-right'
	}

	moveUp(speed) {
		super.moveUp(speed)
		this.direction = DIRECTIONS.UP
		this.img.className = 'enemy-walk-up'
	}

	moveDown(speed) {
		super.moveDown(speed)
		this.direction = DIRECTIONS.DOWN
		this.img.className = 'enemy-walk-down'
	}

	die = () => {
		this.img.className = 'enemy-die'
		this.dead = true
		this.timer = new Timer(() => {
			this.img.className = 'enemy-dead'
			if (this.xp !== 0) {
				new EnemyXP({
					board: this.board, left: this.left, top: this.top, amount: this.xp,
				})
			}
			this.div.remove()
		}, DURATIONS.ENEMY_DIE)
	}
}
