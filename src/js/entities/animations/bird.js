import consts from '../../constants.js'
import { globals as g } from '../../globals.js'
import { evaluate } from '../../macros.js'
import { firstItem } from '../../util/first-item.js'
import { rnd } from '../../math.js'
import Entity from '../entity.js'

export default class Bird extends Entity {
  constructor() {
    super()
    this.regen()
  }

  get z() {
    return consts.LAYER_WEATHER
  }

  regen() {
    this.age = 0
    const { CANVAS_WIDTH, CANVAS_HEIGHT } = consts
    let cameraX = 0,
      cameraY = 0
    if (this.scene) {
      const camera = firstItem(this.scene.category('camera'))
      cameraX = camera.x
      cameraY = camera.y
    }
    this.x = rnd(
      cameraX - evaluate(CANVAS_WIDTH / 2),
      cameraX + evaluate(CANVAS_WIDTH / 2),
    )
    this.y = cameraY - evaluate(CANVAS_HEIGHT / 2 + 100)
    this.rotation = rnd(Math.PI / 4, (Math.PI * 3) / 4)
  }

  cycle(elapsed) {
    super.cycle(elapsed)

    const camera = firstItem(this.scene.category('camera'))
    if (this.y > camera.y + evaluate(g.CANVAS_HEIGHT / 2 + 300)) {
      this.regen()
    }

    this.x += Math.cos(this.rotation) * elapsed * 300
    this.y += Math.sin(this.rotation) * elapsed * 300
  }

  doRender() {
    const { ctx } = g
    ctx.translate(this.x, this.y + 300)

    ctx.withShadow(() => {
      ctx.strokeStyle = ctx.resolveColor('#000')
      ctx.lineWidth = 4
      ctx.beginPath()

      ctx.translate(0, -300)

      const angle =
        (Math.sin(this.age * Math.TWO_PI * 4) * Math.PI) / 16 + Math.PI / 4
      ctx.lineTo(-Math.cos(angle) * 10, -Math.sin(angle) * 10)
      ctx.lineTo(0, 0)
      ctx.lineTo(Math.cos(angle) * 10, -Math.sin(angle) * 10)
      ctx.stroke()
    })
  }
}
