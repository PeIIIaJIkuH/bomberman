import {DIRECTIONS, DURATIONS, PIXEL_SIZE} from '../../../utils/constants.js'
import {playBombermanMoveSound} from '../../../utils/sounds.js'
import {Timer} from '../../../utils/timers/timer.js'
import {Entity} from '../entity.js'

export class Bomberman extends Entity {
	constructor({board, liveCount}) {
		super({board})
		this.left = 2 * PIXEL_SIZE
		this.top = 2 * PIXEL_SIZE
		this.liveCount = liveCount
		this.bombPass = false
		this.flamePass = false
		this.detonator = false
		this.invincible = false
		this.isSurroundedWithBombs = false
	}

	resetPosition = () => {
		this.left = PIXEL_SIZE * 2
		this.top = PIXEL_SIZE * 2
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

	moveLeft(speed) {
		super.moveLeft(speed)
		this.direction = DIRECTIONS.LEFT
		this.img.className = 'bomberman-walk-left'
		playBombermanMoveSound()
	}

	moveRight(speed) {
		super.moveRight(speed)
		this.direction = DIRECTIONS.RIGHT
		this.img.className = 'bomberman-walk-right'
		playBombermanMoveSound()
	}

	moveUp(speed) {
		super.moveUp(speed)
		this.direction = DIRECTIONS.UP
		this.img.className = 'bomberman-walk-up'
		playBombermanMoveSound()
	}

	moveDown(speed) {
		super.moveDown(speed)
		this.direction = DIRECTIONS.DOWN
		this.img.className = 'bomberman-walk-down'
		playBombermanMoveSound()
	}

	die = () => {
		this.img.className = 'bomberman-die'
		this.liveCount--
		this.timer = new Timer(() => {
			this.img.className = 'bomberman-dead'
		}, DURATIONS.BOMBERMAN_DIE)
	}

	reset = settings => {
		this.resetPosition()
		this.left = 2 * PIXEL_SIZE
		this.top = 2 * PIXEL_SIZE
		this.direction = DIRECTIONS.DOWN
		this.liveCount = settings.liveCount
		this.bombPass = false
		this.flamePass = false
		this.detonator = false
		this.invincible = false
		this.isSurroundedWithBombs = false
		this.speed = 1
	}

	draw() {
		super.draw()
		if (this.liveCountDiv)
			this.liveCountDiv.querySelector('span').innerText = `${this.liveCount}`
	}
}