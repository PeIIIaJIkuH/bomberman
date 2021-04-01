import {GAME_MENU, MUSIC_VOLUME, setMusicVolume, setSFXVolume, SFX_VOLUME} from '../../utils/constants.js'
import {playSFXSound} from '../../utils/sounds.js'

export class GameMenu {
	constructor(gameMusic) {
		this.div = document.querySelector('#game-menu')
		this.items = document.querySelectorAll('.game-menu-item')
		this.ranges = document.querySelectorAll('.game-menu-item input[type="range"]')
		this.selected = GAME_MENU.CONTINUE

		this.sounds = gameMusic

		this.hide()
		this.initializeInputs()
	}

	show = () => {
		this.selected = GAME_MENU.CONTINUE
		this.div.style.display = 'flex'
		document.addEventListener('keyup', this.listener)
	}

	hide = () => {
		this.div.style.display = 'none'
		document.removeEventListener('keyup', this.listener)
	}

	toggleRanges = index => {
		this.ranges[index].disabled = false
		this.ranges[1 - index].disabled = true
		this.ranges[index].focus()
	}

	draw = () => {
		if (this.selected === GAME_MENU.SFX) {
			this.toggleRanges(0)
		} else if (this.selected === GAME_MENU.MUSIC) {
			this.toggleRanges(1)
		} else if (this.selected !== GAME_MENU.SFX && this.selected !== GAME_MENU.MUSIC) {
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
			playSFXSound()
		} else if (index === 1) {
			setMusicVolume(this.ranges[1].value)
			playSFXSound(MUSIC_VOLUME)
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
		if (e.code === 'ArrowDown') {
			playSFXSound()
			this.selected = (this.selected + 1) % this.items.length
		} else if (e.code === 'ArrowUp') {
			playSFXSound()
			this.selected = (this.selected - 1) % this.items.length
			if (this.selected < 0)
				this.selected = this.items.length - 1
		}
	}
}