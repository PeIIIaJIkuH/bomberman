import {Media} from './media.js'

export class GameMedia {
	constructor() {
		this.titleScreen = new Media('title-screen-music', true)
		this.stageStart = new Media('stage-start-music', true)
		this.stage = new Media('stage-music', true)
		this.lifeLost = new Media('life-lost-music', true)
		this.ending = new Media('ending-music', true)
		this.over = new Media('over-music', true)
		this.complete = new Media('stage-complete-music', true)
		this.findExit = new Media('find-exit-music', true)
		this.pause = new Media('pause-sound')
		this.die = new Media('die-sound')
		this.bombermanOrigins = new Media('bomberman-origins')
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
		this.pause.div.volume = val
		this.die.div.volume = val
	}

	changeMusicVolume = val => {
		this.titleScreen.div.volume = val
		this.stageStart.div.volume = val
		this.stage.div.volume = val
		this.lifeLost.div.volume = val
		this.ending.div.volume = val
		this.over.div.volume = val
		this.complete.div.volume = val
		this.findExit.div.volume = val
	}
}