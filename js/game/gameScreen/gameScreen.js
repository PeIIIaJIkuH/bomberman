import {Screen} from './screen.js'

export class GameScreen {
	constructor() {
		this.mainMenu = new Screen('main-menu')
		this.mainMenu.show()
		this.stageStart = new Screen('stage-start')
		this.gameOver = new Screen('game-over')
		this.gameOver.show()
		this.gameOver.hideDisplay()
		this.stage = new Screen('board')
		this.ending = new Screen('ending')
		this.ending.show()
		this.ending.hideDisplay()
		this.info = new Screen('game-info')
		this.incorrectArguments = new Screen('incorrect-arguments')
		this.incorrectArguments.show()
		this.incorrectArguments.hideDisplay()
		this.gameScore = new Screen('game-score')
	}

	showStage = () => {
		this.stage.show()
		this.info.show()
	}

	hideStage = () => {
		this.stage.hide()
		this.info.hide()
	}

	setGameScore = score => {
		this.gameScore.div.querySelector('span').innerText = String(score)
	}
	
	removeIncorrectArguments = () => {
		this.incorrectArguments.div.remove()
		this.incorrectArguments = null
	}
}