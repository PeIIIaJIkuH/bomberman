import {DIRECTIONS, PIXEL_SIZE, TILE_SIZE} from '../../utils/constants.js'
import {Bomberman} from './bomberman/bomberman.js'

export class Entity {
	constructor({board, left, top}) {
		this.board = board
		this.speed = PIXEL_SIZE / 2
		this.left = left || PIXEL_SIZE * 2
		this.top = top || PIXEL_SIZE * 2
		this.size = TILE_SIZE * 0.75
		this.direction = DIRECTIONS.DOWN
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

	moveLeft(speed) {
		if (speed)
			this.left -= speed
		else
			this.left -= this.speed
	}

	moveRight(speed) {
		if (speed)
			this.left += speed
		else
			this.left += this.speed
	}

	moveUp(speed) {
		if (speed)
			this.top -= speed
		else
			this.top -= this.speed
	}

	moveDown(speed) {
		if (speed)
			this.top += speed
		else
			this.top += this.speed
	}

	draw() {
		this.div.style.transform = `translate3d(${16 * PIXEL_SIZE + Math.floor(this.left)}px, ${16 * PIXEL_SIZE + Math.floor(this.top)}px, 0)`
	}

	getBorders = ({own = true, floorValues = false} = {}) => {
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

	setLookDirection = entity => {
		const directions = ['left', 'right', 'up', 'down']
		this.img.className = `${entity}-look-${directions[this.direction]}`
	}
}
