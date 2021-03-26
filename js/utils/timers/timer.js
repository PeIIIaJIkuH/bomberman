export class Timer {
	constructor(callback, delay) {
		this.callback = callback
		this.remaining = delay

		this.resume()
	}

	pause() {
		this.clear()
		this.remaining -= new Date().getTime() - this.start
	}

	resume() {
		this.start = new Date().getTime()
		this.clear()
		this.timerID = setTimeout(this.callback, this.remaining)
	}

	clear() {
		clearTimeout(this.timerID)
	}
}