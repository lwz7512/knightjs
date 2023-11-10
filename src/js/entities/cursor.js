import Entity from './entity.js'
import consts from '../constants.js'
import { globals as g } from '../globals.js'

export default class Cursor extends Entity {
  constructor(player) {
    super()
    this.player = player
  }

  get z() {
    return consts.LAYER_PLAYER_HUD
  }

  doRender() {
    if (g.inputMode == consts.INPUT_MODE_TOUCH) return
    const { ctx } = g
    ctx.translate(this.player.controls.aim.x, this.player.controls.aim.y)

    ctx.fillStyle = '#000'
    ctx.rotate(Math.PI / 4)
    ctx.fillRect(-15, -5, 30, 10)
    ctx.rotate(Math.PI / 2)
    ctx.fillRect(-15, -5, 30, 10)
  }
}
