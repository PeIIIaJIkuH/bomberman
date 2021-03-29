export const getRandomInt = (min, max) => {
	min = Math.ceil(min)
	max = Math.ceil(max)
	return Math.floor(Math.random() * (max - min)) + min
}

export const getRandomDirection = (directions = ['left', 'right', 'up', 'down']) => {
	return directions[getRandomInt(0, directions.length)]
}

export const createId = (x, y) => `${x}-${y}`

export const changeTitle = title => {
	document.title = title
}

export const isRectangle = arr => {
	const size = arr[0].length
	for (const row of arr)
		if (row.length !== size)
			return false
	return true
}

export const tileCount = (arr, type) => {
	let sum = 0
	for (const row of arr)
		for (const tile of row)
			if (tile === type)
				sum++
	return sum
}

export const powerUpsCount = powerUps => {
	let sum = 0
	for (const num of Object.values(powerUps))
		sum += num
	return sum
}
