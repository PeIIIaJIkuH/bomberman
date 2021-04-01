import {SFX_VOLUME} from './constants.js'
import {Timer} from './timers/timer.js'

export const playExplosionSound = () => {
	const sound = document.createElement('audio')
	sound.src = './assets/sounds/explosion.wav'
	sound.volume = SFX_VOLUME
	sound.play().then()
}

export const playBombLeaveSound = () => {
	const sound = document.createElement('audio')
	sound.src = './assets/sounds/leave-bomb.wav'
	sound.volume = SFX_VOLUME
	sound.play().then()
}

export const playPowerUpPickedSound = () => {
	const sound = document.createElement('audio')
	sound.src = './assets/sounds/power-up.wav'
	sound.volume = SFX_VOLUME
	sound.play().then()
}

let wasSFXSoundPlayed = false,
	wasBombermanMoveSoundPlayed = false

export const playSFXSound = (volume = SFX_VOLUME) => {
	if (!wasSFXSoundPlayed) {
		const sound = document.createElement('audio')
		sound.src = './assets/sounds/volume-change.wav'
		sound.volume = volume
		sound.play().then()
		wasSFXSoundPlayed = true
		new Timer(() => {
			wasSFXSoundPlayed = false
		}, 100)
	}
}

export const playBombermanMoveSound = () => {
	if (!wasBombermanMoveSoundPlayed) {
		const sound = document.createElement('audio')
		sound.src = './assets/sounds/bomberman-move.wav'
		sound.volume = SFX_VOLUME
		sound.play().then()
		wasBombermanMoveSoundPlayed = true
		new Timer(() => {
			wasBombermanMoveSoundPlayed = false
		}, 200)
	}
}