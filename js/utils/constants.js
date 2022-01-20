export const PIXEL_SIZE = 3,
	TILE_SIZE = PIXEL_SIZE * 16

export const DEFAULT = {
	ROWS: 13,
	COLUMNS: 31,
	ROUND_TIME: 200,
}

export const DURATIONS = {
	BOMB_COUNTDOWN: 2000,
	WALL_EXPLOSION: 500,
	ENEMY_XP: 2000,
	ENEMY_DIE: 1100,
	BOMBERMAN_DIE: 600,
	CHAIN_EXPLOSION: 100,
	ROUND_TIME: 200,
}

export const GAME_MENU = {
	CONTINUE: 0,
	RESTART: 1,
	SFX: 2,
	MUSIC: 3,
	MAIN_MENU: 4,
}

export const MAIN_MENU = {
	START: 0,
	CONTROLS: 1,
	HELP: 2,
	LEADERBOARD: 3,
}

export const ENEMY_TYPES = ['balloom', 'oneal', 'doll', 'minvo', 'kondoria', 'ovapi', 'pass', 'pontan'],
	POWER_UP_TYPES = ['bombs', 'flames', 'speed', 'wall-pass', 'detonator', 'bomb-pass', 'flame-pass', 'mystery']

export const POWER_UPS = {
	SPEED_BOOST: 0.25,
	INVINCIBLE_DURATION: 30000,
}

export let SFX_VOLUME = 0.2,
	MUSIC_VOLUME = 0.2

export const TILES = {
	EMPTY: 0,
	ROCK: 1,
	WALL: 2,
}

export const DIRECTIONS = {
	LEFT: 0,
	RIGHT: 1,
	UP: 2,
	DOWN: 3,
}

let ENEMY_ID = 0

export const setSFXVolume = val => {
	SFX_VOLUME = val
}

export const setMusicVolume = val => {
	MUSIC_VOLUME = val
}

export const createEnemyId = () => {
	ENEMY_ID++
	return ENEMY_ID
}

export const resetEnemyId = () => {
	ENEMY_ID = 0
}

export const XP_TO_UPGRADE = 3000
