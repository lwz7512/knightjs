import constants from './constants.js'
import { nomangle } from './macros.js'
import './typedef.js'

/**
 * windows object shortcut
 */
export const w = window

/** @type {KnightCanvasContext} */
export const canvasPrototype = CanvasRenderingContext2D.prototype

const inputMode = navigator.userAgent.match(nomangle(/andro|ipho|ipa|ipo/i))
  ? constants.INPUT_MODE_TOUCH
  : constants.INPUT_MODE_MOUSE

/** @type {GlobalGameContext} */
export const globals = {
  audioCtx: null,
  can: null,
  ctx: null,
  GAME_PAUSED: false,
  BEATEN: false,
  MOUSE_RIGHT_DOWN: false,
  MOUSE_DOWN: false,
  MOUSE_POSITION: { x: 0, y: 0 },
  inputMode,
  level: null,
}
