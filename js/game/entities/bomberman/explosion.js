import {DURATIONS} from '../../../utils/constants.js'
import {createId} from '../../../utils/helpers.js'
import {Timer} from '../../../utils/timers/timer.js'

export class Explosion {
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
		new Timer(() => {
			div.remove()
		}, DURATIONS.WALL_EXPLOSION)
		return div
	}

	create = (x, y, className) => {
		let created = true,
			isWall = false,
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
			}, DURATIONS.WALL_EXPLOSION)
			created = true
			isWall = true
		} else if (this.stage.isRock(x, y))
			created = false
		const id = createId(x, y)
		return {id, created, div, isWall}
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
			const {id, div, created, isWall} = this.create(i, this.y, 'explosion-horizontal')
			if (created) {
				this.divs.set(id, div)
				if (isWall)
					return false
			} else
				return false
		}
		return true
	}
	createRightHorizontals = () => {
		for (let i = this.x + 1; i < this.x + this.size; i++) {
			const {id, div, created, isWall} = this.create(i, this.y, 'explosion-horizontal')
			if (created) {
				this.divs.set(id, div)
				if (isWall)
					return false
			} else
				return false
		}
		return true
	}
	createTopVerticals = () => {
		for (let i = this.y - 1; i >= this.y - this.size + 1; i--) {
			const {id, div, created, isWall} = this.create(this.x, i, 'explosion-vertical')
			if (created) {
				this.divs.set(id, div)
				if (isWall)
					return false
			} else
				return false
		}
		return true
	}
	createBottomVerticals = () => {
		for (let i = this.y + 1; i < this.y + this.size; i++) {
			const {id, div, created, isWall} = this.create(this.x, i, 'explosion-vertical')
			if (created) {
				this.divs.set(id, div)
				if (isWall)
					return false
			} else
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