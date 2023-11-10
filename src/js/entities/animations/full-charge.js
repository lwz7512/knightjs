import Entity from '../entity.js'
import constants from '../../constants.js'
import { globals as g } from '../../globals.js'
import { TWO_PI } from '../../math.js'

export default class FullCharge extends Entity {
  get z() {
    return constants.LAYER_ANIMATIONS
  }

  cycle(elapsed) {
    super.cycle(elapsed)
    if (this.age > 0.25) {
      this.remove()
    }
  }

  doRender() {
    const ratio = this.age / 0.25
    const { ctx } = g
    ctx.translate(this.x, this.y)
    ctx.scale(ratio, ratio)

    ctx.globalAlpha = 1 - ratio
    ctx.strokeStyle = '#ff0'
    ctx.lineWidth = 10
    ctx.beginPath()
    ctx.arc(0, 0, 80, 0, TWO_PI)
    ctx.stroke()
  }
}
