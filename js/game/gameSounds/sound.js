import {MUSIC_VOLUME, SFX_VOLUME} from '../../utils/constants.js'

export class Sound {
	constructor(id, music) {
		this.audio = document.getElementById(id)
		this.audio.volume = SFX_VOLUME
		if (music)
			this.audio.volume = MUSIC_VOLUME
	}

	play = () => {
		this.audio.play().then()
	}

	pause = () => {
		this.audio.pause()
	}

	clear = () => {
		this.audio.currentTime = 0
	}

	stop = () => {
		this.pause()
		this.clear()
	}

	durationMS = () => {
		return this.audio.duration * 1000
	}
}