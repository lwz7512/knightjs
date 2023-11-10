import consts from '../../constants.js'
import { globals as g } from '../../globals.js'
import { TWO_PI } from '../../math.js'
import { regenEntity } from '../../util/regen-entity.js'
import Entity from '../entity.js'

export default class Water extends Entity {
  constructor() {
    super()
    this.categories.push('water')
    this.width = this.height = 0
  }

  get z() {
    return consts.LAYER_WATER
  }

  get inWater() {
    return false
  }

  cycle(elapsed) {
    super.cycle(elapsed)
    this.renderPadding = Math.max(this.width, this.height) / 2
    regenEntity(
      this,
      consts.CANVAS_WIDTH * 2,
      consts.CANVAS_HEIGHT * 2,
      Math.max(this.width, this.height),
    )
  }

  contains(point) {
    const xInSelf = point.x - this.x
    const yInSelf = point.y - this.y

    const xInSelfRotated =
      xInSelf * Math.cos(this.rotation) + yInSelf * Math.sin(this.rotation)
    const yInSelfRotated =
      -xInSelf * Math.sin(this.rotation) + yInSelf * Math.cos(this.rotation)

    return (
      Math.abs(xInSelfRotated) < this.width / 2 &&
      Math.abs(yInSelfRotated) < this.height / 2
    )
  }

  doRender() {
    this.rng.reset()
    const { ctx } = g
    ctx.wrap(() => {
      ctx.fillStyle = '#08a'
      ctx.translate(this.x, this.y)
      ctx.rotate(this.rotation)
      ctx.beginPath()
      ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height)
      ctx.fill()
      ctx.clip()

      // Ripples
      ctx.rotate(-this.rotation)
      ctx.scale(1, 0.5)
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 4

      for (let i = 3; i--; ) {
        const relativeAge =
          (this.age + this.rng.next(0, 20)) / consts.RIPPLE_DURATION
        const ratio = Math.min(1, relativeAge % (consts.RIPPLE_DURATION / 2))

        ctx.globalAlpha = (1 - ratio) / 2
        ctx.beginPath()
        ctx.arc(
          ((this.rng.next(0, this.width) + ~~relativeAge * this.width * 0.7) %
            this.width) -
            this.width / 2,
          ((this.rng.next(0, this.height) + ~~relativeAge * this.height * 0.7) %
            this.height) -
            this.width / 2,
          ratio * this.rng.next(20, 60),
          0,
          TWO_PI,
        )
        ctx.stroke()
      }
    })
  }
}
