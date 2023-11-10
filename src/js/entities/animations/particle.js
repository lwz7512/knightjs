import Entity from '../entity.js'
import constants from '../../constants.js'
import { globals as g } from '../../globals.js'

export default class Particle extends Entity {
  constructor(color, valuesSize, valuesX, valuesY, duration) {
    super()
    this.color = color
    this.valuesSize = valuesSize
    this.valuesX = valuesX
    this.valuesY = valuesY
    this.duration = duration
  }

  get z() {
    return constants.LAYER_PARTICLE
  }

  cycle(elapsed) {
    super.cycle(elapsed)
    if (this.age > this.duration) {
      this.remove()
    }
  }

  interp(property) {
    const progress = this.age / this.duration
    return property[0] + progress * (property[1] - property[0])
  }

  doRender() {
    const size = this.interp(this.valuesSize)
    const { ctx } = g
    ctx.translate(
      this.interp(this.valuesX) - size / 2,
      this.interp(this.valuesY) - size / 2,
    )
    ctx.rotate(Math.PI / 4)

    ctx.fillStyle = this.color
    ctx.globalAlpha = this.interp([1, 0])
    ctx.fillRect(0, 0, size, size)
  }
}
