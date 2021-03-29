export const PIXEL_SIZE = 2,
	TILE_SIZE = PIXEL_SIZE * 16,
	DEFAULT_ROWS = 13,
	DEFAULT_COLUMNS = 31,
	DEFAULT_ROUND_TIME = 200,
	EXPLOSION_TIME = 2000,
	WALL_EXPLOSION_TIME = 500

export const ENEMY_TYPES = ['balloom', 'oneal', 'doll', 'minvo', 'kondoria', 'ovapi', 'pass', 'pontan'],
	POWER_UP_TYPES = ['bombs', 'flames', 'speed', 'wall-pass', 'detonator', 'bomb-pass', 'flame-pass', 'mystery']

export const POWER_UP_SPEED_BOOST = 0.25,
	POWER_UP_INVINCIBLE_TIME = 30000

export let SFX_VOLUME = 0.2,
	MUSIC_VOLUME = 0.2

export const TILES = {
	EMPTY: 0,
	ROCK: 1,
	WALL: 2
}

export function setSFXVolume(val) {
	SFX_VOLUME = val
}

export function setMusicVolume(val) {
	MUSIC_VOLUME = val
}

export const ENEMY_XP_SHOW_TIME = 2000,
	ENEMY_DYING_TIME = 1100,
	BOMBERMAN_DYING_TIME = 600,
	CHAIN_EXPLOSION_TIME = 100

export const GAME_MENU_CONTINUE = 0,
	GAME_MENU_RESTART_STAGE = 1,
	GAME_MENU_RESTART_GAME = 2,
	GAME_MENU_SFX = 3,
	GAME_MENU_MUSIC = 4,
	GAME_MENU_MAIN_MENU = 5

export let ENEMY_ID = 0

export function increaseEnemyId() {
	ENEMY_ID++
}

export function resetEnemyId() {
	ENEMY_ID = 0
}