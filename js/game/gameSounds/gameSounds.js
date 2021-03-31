import {Sound} from './sound.js'

export class GameSounds {
	constructor() {
		this.titleScreen = new Sound('title-screen-music', true)
		this.stageStart = new Sound('stage-start-music', true)
		this.stage = new Sound('stage-music', true)
		this.lifeLost = new Sound('life-lost-music', true)
		this.ending = new Sound('ending-music', true)
		this.over = new Sound('over-music', true)
		this.complete = new Sound('stage-complete-music', true)
		this.findExit = new Sound('find-exit-music', true)
		this.pause = new Sound('pause-sound')
		this.die = new Sound('die-sound')
	}

	playStageMusic = areEnemiesDead => {
		if (!areEnemiesDead)
			this.stage.play()
		else
			this.findExit.play()
	}

	pauseStageMusic = () => {
		this.stage.pause()
		this.findExit.pause()
	}

	clearStageMusic = () => {
		this.stage.clear()
		this.findExit.clear()
	}

	changeSFXVolume = val => {
		this.pause.audio.volume = val
		this.die.audio.volume = val
	}

	changeMusicVolume = val => {
		this.titleScreen.audio.volume = val
		this.stageStart.audio.volume = val
		this.stage.audio.volume = val
		this.lifeLost.audio.volume = val
		this.ending.audio.volume = val
		this.over.audio.volume = val
		this.complete.audio.volume = val
		this.findExit.audio.volume = val
	}
}