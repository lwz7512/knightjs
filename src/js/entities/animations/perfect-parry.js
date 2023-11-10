import Entity from '../entity.js'
import constants from '../../constants.js'
import { globals as g } from '../../globals.js'
import { TWO_PI, rnd } from '../../math.js'

export default class PerfectParry extends Entity {
  constructor() {
    super()
    this.affectedBySpeedRatio = false
  }

  get z() {
    return constants.LAYER_ANIMATIONS
  }

  cycle(elapsed) {
    super.cycle(elapsed)
    if (this.age > 0.5) {
      this.remove()
    }
  }

  doRender() {
    const ratio = this.age / 0.5
    const { ctx } = g
    ctx.fillStyle = '#fff'

    ctx.translate(this.x, this.y)

    ctx.globalAlpha = 1 - ratio
    ctx.strokeStyle = '#fff'
    ctx.fillStyle = '#fff'
    ctx.lineWidth = 20
    ctx.beginPath()

    for (let r = 0; r < 1; r += 0.05) {
      const angle = r * TWO_PI
      const radius = ratio * rnd(140, 200)
      ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
    }

    // ctx.closePath();

    // // ctx.arc(0, 0, 100, 0, TWO_PI);
    // ctx.stroke();
    ctx.fill()
  }
}
