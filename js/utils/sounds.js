import {SFX_VOLUME} from './constants.js'

export const playExplosionSound = () => {
	const sound = document.createElement('audio')
	sound.src = './sounds/explosion.wav'
	sound.volume = SFX_VOLUME
	sound.play().then()
}

export const playBombLeaveSound = () => {
	const sound = document.createElement('audio')
	sound.src = './sounds/leave-bomb.wav'
	sound.volume = SFX_VOLUME
	sound.play().then()
}

export const playPowerUpPickedSound = () => {
	const sound = document.createElement('audio')
	sound.src = './sounds/power-up.wav'
	sound.volume = SFX_VOLUME
	sound.play().then()
}

export const playChangeVolumeSound = volume => {
	const sound = document.createElement('audio')
	sound.src = './sounds/volume-change.wav'
	sound.volume = volume
	sound.play().then()
}