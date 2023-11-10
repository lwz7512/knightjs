import Entity from './entity.js'
import consts from '../constants.js'
import { globals as g } from '../globals.js'
import { roundToNearest } from '../math.js'

export default class Path extends Entity {
  get z() {
    return consts.LAYER_PATH
  }

  doRender(camera) {
    const { ctx } = g
    ctx.strokeStyle = '#dc9'
    ctx.lineWidth = 70

    ctx.fillStyle = '#fff'

    ctx.beginPath()
    for (
      let x = roundToNearest(camera.x - consts.CANVAS_WIDTH * 2, 300);
      x < camera.x + consts.CANVAS_WIDTH;
      x += 300
    ) {
      const y = this.scene.pathCurve(x)
      ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
}
