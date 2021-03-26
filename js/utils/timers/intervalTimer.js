export class IntervalTimer {
	constructor(callback) {
		this.callback = callback
		this.resume()
	}

	resume() {
		this.clear()
		this.timerId = setInterval(this.callback, 1000)
	}

	clear() {
		clearInterval(this.timerId)
	}
}