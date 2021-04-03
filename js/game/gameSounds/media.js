import {MUSIC_VOLUME, SFX_VOLUME} from '../../utils/constants.js'

export class Media {
	constructor(id, music) {
		this.div = document.getElementById(id)
		this.div.volume = SFX_VOLUME
		if (music)
			this.div.volume = MUSIC_VOLUME
	}

	play = () => {
		this.div.play().then()
	}

	pause = () => {
		this.div.pause()
	}

	clear = () => {
		this.div.currentTime = 0
	}

	stop = () => {
		this.pause()
		this.clear()
	}

	durationMS = () => {
		return this.div.duration * 1000
	}
}