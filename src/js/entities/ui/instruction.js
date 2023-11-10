import { globals as g } from '../../globals.js'
import consts from '../../constants.js'
import { interpolate } from '../../math.js'
import Entity from '../entity.js'

export default class Instruction extends Entity {
  get z() {
    return consts.LAYER_INSTRUCTIONS
  }

  cycle(elapsed) {
    super.cycle(elapsed)

    if (this.text != this.previousText) {
      this.previousText = this.text
      this.textAge = 0
    }
    this.textAge += elapsed
  }

  doRender(camera) {
    if (!this.text || consts.GAME_PAUSED) return

    this.cancelCameraOffset(camera)
    const { ctx } = g
    ctx.translate(consts.CANVAS_WIDTH / 2, (consts.CANVAS_HEIGHT * 5) / 6)

    ctx.scale(
      interpolate(1.2, 1, this.textAge * 8),
      interpolate(1.2, 1, this.textAge * 8),
    )
    ctx.renderInstruction(this.text)
  }
}
