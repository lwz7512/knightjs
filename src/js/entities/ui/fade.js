import consts from '../../constants.js'
import { globals as g } from '../../globals.js'
import Entity from '../entity.js'

export default class Fade extends Entity {
  constructor() {
    super()
    this.alpha = 1
  }

  get z() {
    return consts.LAYER_FADE
  }

  doRender(camera) {
    this.cancelCameraOffset(camera)
    const { ctx } = g
    ctx.fillStyle = '#000'
    ctx.globalAlpha = this.alpha
    ctx.fillRect(0, 0, consts.CANVAS_WIDTH, consts.CANVAS_HEIGHT)
  }
}
