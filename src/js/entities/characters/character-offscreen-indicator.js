import Entity from '../entity.js'
import consts from '../../constants.js'
import { between, angleBetween, TWO_PI } from '../../math.js'
import { globals as g } from '../../globals.js'

export default class CharacterOffscreenIndicator extends Entity {
  constructor(character) {
    super()
    this.character = character
  }

  get z() {
    return consts.LAYER_PLAYER_HUD
  }

  cycle(elapsed) {
    super.cycle(elapsed)
    if (!this.character.health) this.remove()
  }

  doRender(camera) {
    if (
      Math.abs(camera.x - this.character.x) <
        consts.CANVAS_WIDTH / 2 / camera.appliedZoom &&
      Math.abs(camera.y - this.character.y) <
        consts.CANVAS_HEIGHT / 2 / camera.appliedZoom
    )
      return

    const x = between(
      camera.x - (consts.CANVAS_WIDTH / 2 - 50) / camera.appliedZoom,
      this.character.x,
      camera.x + (consts.CANVAS_WIDTH / 2 - 50) / camera.appliedZoom,
    )
    const y = between(
      camera.y - (consts.CANVAS_HEIGHT / 2 - 50) / camera.appliedZoom,
      this.character.y,
      camera.y + (consts.CANVAS_HEIGHT / 2 - 50) / camera.appliedZoom,
    )
    const { ctx } = g
    ctx.translate(x, y)

    ctx.beginPath()
    ctx.wrap(() => {
      ctx.shadowColor = '#000'
      ctx.shadowBlur = 5

      ctx.fillStyle = '#f00'
      ctx.rotate(angleBetween({ x, y }, this.character))
      ctx.arc(0, 0, 20, -Math.PI / 4, Math.PI / 4, true)
      ctx.lineTo(40, 0)
      ctx.closePath()
      ctx.fill()

      ctx.shadowBlur = 0

      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(0, 0, 15, 0, TWO_PI, true)
      ctx.fill()
    })
    ctx.clip()

    ctx.resolveColor = () => '#f00'
    ctx.scale(0.4, 0.4)
    ctx.translate(0, 30)
    ctx.scale(this.character.facing, 1)
    this.character.renderBody()
  }
}
