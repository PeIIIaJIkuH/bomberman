export class Screen {
	constructor(id, display = 'flex') {
		this.div = document.querySelector(`#${id}`)
		this.display = display
		this.hide()
	}

	hide = () => {
		this.div.style.display = 'none'
	}

	show = () => {
		this.div.style.display = this.display
	}
}