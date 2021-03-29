import {
	GAME_MENU,
	MUSIC_VOLUME, setMusicVolume,
	setSFXVolume,
	SFX_VOLUME
} from '../../utils/constants.js'
import {playChangeVolumeSound} from '../../utils/sounds.js'

export class GameMenu {
	constructor(gameMusic) {
		this.div = document.querySelector('#game-menu')
		this.items = document.querySelectorAll('.game-menu-item')
		this.ranges = document.querySelectorAll('.game-menu-item input[type="range"]')
		this.selected = GAME_MENU.CONTINUE

		this.sounds = gameMusic

		this.initializeInputs()
	}

	show = () => {
		this.selected = GAME_MENU.CONTINUE
		this.div.className = 'game-menu-show'
		document.addEventListener('keyup', this.listener)
	}

	hide = () => {
		this.div.className = 'game-menu-hide'
		document.removeEventListener('keyup', this.listener)
	}

	draw = () => {
		if (this.selected === GAME_MENU.SFX) {
			this.ranges[0].disabled = false
			this.ranges[1].disabled = true
			this.ranges[0].focus()
		}
		if (this.selected === GAME_MENU.MUSIC) {
			this.ranges[0].disabled = true
			this.ranges[1].disabled = false
			this.ranges[1].focus()
		}
		if (this.selected !== GAME_MENU.SFX && this.selected !== GAME_MENU.MUSIC) {
			this.unFocusAll()
		}
		this.items.forEach((item, i) => {
			item.className = 'game-menu-item'
			if (this.selected === i)
				item.classList.add('game-menu-item-selected')
		})
	}

	changeVolume = index => {
		if (index === 0) {
			setSFXVolume(this.ranges[0].value)
			playChangeVolumeSound(SFX_VOLUME)
		} else if (index === 1) {
			setMusicVolume(this.ranges[1].value)
			playChangeVolumeSound(MUSIC_VOLUME)
		}
		this.sounds.changeSFXVolume(SFX_VOLUME)
		this.sounds.changeMusicVolume(MUSIC_VOLUME)
	}

	initializeInputs = () => {
		const callback = e => {
			const i = this.selected - GAME_MENU.SFX
			if (e.code === 'ArrowLeft') {
				this.ranges[i].stepDown()
				this.changeVolume(i)
				this.ranges[i].stepUp()
			} else if (e.code === 'ArrowRight') {
				this.ranges[i].stepUp()
				this.changeVolume(i)
				this.ranges[i].stepDown()
			} else if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
				e.preventDefault()
			}
		}

		for (const range of this.ranges) {
			range.addEventListener('keydown', callback)
			range.addEventListener('click', e => e.preventDefault())
		}
	}

	unFocusAll = () => {
		for (const range of this.ranges) {
			range.blur()
			range.disabled = true
		}
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