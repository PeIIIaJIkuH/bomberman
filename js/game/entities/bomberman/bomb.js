import {DURATIONS} from '../../../utils/constants.js'
import {createId} from '../../../utils/helpers.js'
import {playExplosionSound} from '../../../utils/sounds.js'
import {Timer} from '../../../utils/timers/timer.js'
import {Explosion} from './explosion.js'

export class Bomb {
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
		}, DURATIONS.WALL_EXPLOSION)
		this.stage.explosions.set(explosion.id, explosion)
		playExplosionSound()
	}

	explodeAfter = () => {
		this.timer = new Timer(() => {
			this.createExplosions()
			this.stage.deleteBomb(this.x, this.y)
		}, DURATIONS.BOMB_COUNTDOWN)
	}
}