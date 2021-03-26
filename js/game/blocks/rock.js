import {createId} from '../../utils/helpers.js'
import {Block} from './block.js'

export class Rock extends Block {
	constructor({board, x, y}) {
		super({board, x, y})
		this.id = createId(x, y)

		this.addClass()
	}

	addClass = () => {
		this.div.classList.add('rock')
	}
}