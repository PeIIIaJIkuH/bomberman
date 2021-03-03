class Player {
	constructor() {
		this.left = 0
		this.top = 0
		this.step = 5
		this.init()
	}

	init = () => {
		this.root = document.getElementsByClassName('root')[0]
		this.div = document.createElement('div')
		this.div.classList.add('player')
		this.div.style.left = `${this.left}px`
		this.div.style.top = `${this.top}px`
		this.addEventListeners()
		this.root.append(this.div)
	}

	addEventListeners = () => {
		document.addEventListener('keydown', e => {
			if (e.code === 'KeyD') {
				this.moveRight()
			} else if (e.code === 'KeyA') {
				this.moveLeft()
			} else if (e.code === 'KeyW') {
				this.moveUp()
			} else if (e.code === 'KeyS') {
				this.moveDown()
			}
		})
	}

	changeLeft = val => {
		const left = this.div.style.left
		this.div.style.left = `${parseInt(left.substr(0, left.length - 2)) + val}px`
	}
	changeTop = val => {
		const top = this.div.style.top
		this.div.style.top = `${parseInt(top.substr(0, top.length - 2)) + val}px`
	}

	moveLeft = () => {
		this.changeLeft(-this.step)
	}
	moveRight = () => {
		this.changeLeft(this.step)
	}
	moveUp = () => {
		this.changeTop(-this.step)
	}
	moveDown = () => {
		this.changeTop(this.step)
	}
}

const player = new Player()
