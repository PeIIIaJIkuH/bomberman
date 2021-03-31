export class GameSettings {
	constructor(bombCount, liveCount, explosionSize, stages) {
		this.bombCount = bombCount
		this.liveCount = liveCount
		this.explosionSize = explosionSize
		this.completed = false
		this.wasPaused = false
		this.stageNumber = 0
		this.stages = stages
	}
	
	getStageNumber = () => this.stageNumber + 1
	
	getStage = () => this.stages[this.stageNumber]
	
	isLastStage = () => this.stageNumber >= this.stages.length
}