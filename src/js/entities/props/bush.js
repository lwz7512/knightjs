import Entity from '../entity.js'
import consts from '../../constants.js'
import { globals as g } from '../../globals.js'
import { TWO_PI } from '../../math.js'
import { regenEntity } from '../../util/regen-entity.js'

export default class Bush extends Entity {
  constructor() {
    super()
    this.renderPadding = 100
  }

  cycle(elapsed) {
    super.cycle(elapsed)
    regenEntity(
      this,
      consts.CANVAS_WIDTH / 2 + 50,
      consts.CANVAS_HEIGHT / 2 + 50,
    )
  }

  doRender() {
    const { ctx } = g
    ctx.translate(this.x, this.y)

    ctx.withShadow(() => {
      this.rng.reset()

      let x = 0
      for (let i = 0; i < 5; i++) {
        ctx.wrap(() => {
          ctx.fillStyle = ctx.resolveColor('green')
          ctx.translate(x, 0)
          ctx.rotate(
            Math.sin(
              ((this.age + this.rng.next(0, 5)) * TWO_PI) / this.rng.next(4, 8),
            ) * this.rng.next(Math.PI / 32, Math.PI / 16),
          )
          ctx.fillRect(-10, 0, 20, -this.rng.next(20, 60))
        })

        x += this.rng.next(5, 15)
      }
    })
  }
}
