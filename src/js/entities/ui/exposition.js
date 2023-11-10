import consts from '../../constants.js'
import { globals as g } from '../../globals.js'
import { nomangle, evaluate } from '../../macros.js'
import { between } from '../../math.js'
import Entity from '../entity.js'

export default class Exposition extends Entity {
  constructor(text) {
    super()
    this.text = text
    this.alpha = 1
  }

  get z() {
    return consts.LAYER_INSTRUCTIONS
  }

  doRender(camera) {
    if (!this.text) return

    this.cancelCameraOffset(camera)
    const { ctx } = g
    ctx.translate(150, evaluate(consts.CANVAS_HEIGHT / 2))

    ctx.textBaseline = nomangle('middle')
    ctx.textAlign = nomangle('left')
    ctx.fillStyle = '#fff'
    ctx.font = nomangle('24pt Times New Roman')

    let y = (-this.text.length / 2) * 50
    let lineIndex = 0
    for (const line of this.text) {
      ctx.globalAlpha = between(0, this.age - lineIndex * 3, 1) * this.alpha
      ctx.fillText(line, 0, y)
      y += 75
      lineIndex++
    }
  }
}
