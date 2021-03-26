import {createId} from '../../utils/helpers.js'
import {Block} from './block.js'

export class PowerUp extends Block {
	constructor({board, x, y, type}) {
		super({board, x, y})
		this.id = createId(x, y)
		this.type = type

		this.addClass()
	}

	addClass = () => {
		this.div.classList.add('power-up', `power-up-${this.type}`)
	}
}