import { canvasPrototype } from '../globals.js'
import { globals as g } from '../globals.js'

canvasPrototype.slice = (radius, sliceUp, ratio) => {
  g.ctx.beginPath()
  if (sliceUp) {
    g.ctx.moveTo(-radius, -radius)
    g.ctx.lineTo(radius, -radius)
  } else {
    g.ctx.lineTo(-radius, radius)
    g.ctx.lineTo(radius, radius)
  }

  g.ctx.lineTo(radius, -radius * ratio)
  g.ctx.lineTo(-radius, radius * ratio)
  g.ctx.clip()
}
