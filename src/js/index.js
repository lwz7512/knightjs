import consts from './constants.js'
import { nomangle } from './macros.js'
import { globals as g, w } from './globals.js'
// after globals import...
import './graphics/slice.js'
import './graphics/wrap.js'
import './graphics/text.js'
import './graphics/with-shadow.js'
import './graphics/characters/body.js'

import LevelManager from './level-manager.js'
import Player from './entities/characters/player.js'

let lastFrame = performance.now()

const {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  RENDER_PLAYER_ICON,
  RENDER_SCREENSHOT,
  DEBUG,
} = consts

const commander = new LevelManager()
commander.goLevel('intro')

if (RENDER_SCREENSHOT) commander.goLevel('screenshot')

const frame = () => {
  const { ctx } = g
  const current = performance.now()
  const elapsed = (current - lastFrame) / 1000
  lastFrame = current

  // Game update
  if (!RENDER_SCREENSHOT) g.level.cycle(elapsed)

  // Rendering
  ctx.wrap(() => g.level.scene.render())

  if (DEBUG && !RENDER_SCREENSHOT) {
    ctx.fillStyle = '#fff'
    ctx.strokeStyle = '#000'
    ctx.textAlign = nomangle('left')
    ctx.textBaseline = nomangle('bottom')
    ctx.font = nomangle('14pt Courier')
    ctx.lineWidth = 3

    let y = CANVAS_HEIGHT - 10
    for (const line of [
      nomangle('FPS: ') + ~~(1 / elapsed),
      nomangle('Entities: ') + g.level.scene.entities.size,
    ].reverse()) {
      ctx.strokeText(line, 10, y)
      ctx.fillText(line, 10, y)
      y -= 20
    }
  }

  w.requestAnimationFrame(frame)
}

/**
 * initialize global variables
 *
 * @returns
 */
w.onload = () => {
  g.can = document.querySelector(nomangle('canvas'))
  g.can.width = CANVAS_WIDTH
  g.can.height = CANVAS_HEIGHT
  g.ctx = g.can.getContext('2d')

  // if (inputMode == INPUT_MODE_TOUCH) {
  //     can.width *= 0.5;
  //     can.height *= 0.5;
  //     ctx.scale(0.5, 0.5);
  // }
  // w.onresize()

  if (RENDER_PLAYER_ICON) {
    w.oncontextmenu = () => {}
    g.ctx.wrap(() => {
      g.can.width *= 10
      g.can.height *= 10
      g.ctx.scale(10, 10)

      g.ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
      g.ctx.scale(5, 5)
      g.ctx.translate(0, 30)
      new Player().renderBody()
    })
    return
  }
  // start looping...
  frame()
}
