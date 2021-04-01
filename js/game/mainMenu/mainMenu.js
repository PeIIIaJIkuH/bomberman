import {MAIN_MENU} from '../../utils/constants.js'
import {playSFXSound} from '../../utils/sounds.js'

export class MainMenu {
	constructor() {
		this.div = document.querySelector('#main-menu')
		this.items = document.querySelectorAll('.main-menu-item')
		this.selected = MAIN_MENU.START

		this.addEventListener()
	}

	draw = () => {
		this.items.forEach((item, i) => {
			item.className = 'main-menu-item'
			if (this.selected === i)
				item.classList.add('main-menu-item-selected')
		})
	}

	addEventListener = () => {
		document.addEventListener('keydown', e => {
			if (e.code === 'ArrowDown') {
				playSFXSound()
				this.selected = (this.selected + 1) % this.items.length
			} else if (e.code === 'ArrowUp') {
				playSFXSound()
				this.selected = (this.selected - 1) % this.items.length
				if (this.selected < 0)
					this.selected = this.items.length - 1
			}
		})
	}

	hide = () => {
		this.div.style.display = 'none'
	}
}