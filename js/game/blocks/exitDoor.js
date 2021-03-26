import {Block} from './block.js'

export class ExitDoor extends Block {
	constructor({board, x, y}) {
		super({board, x, y})

		this.addClass()
	}

	addClass = () => {
		this.div.classList.add('exit-door')
	}
}