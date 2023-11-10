import Entity from '../entity.js'
import consts from '../../constants.js'
import { globals as g } from '../../globals.js'
import { evaluate, nomangle } from '../../macros.js'

export default class Logo extends Entity {
  constructor() {
    super()
    this.alpha = 1
  }

  get z() {
    return consts.LAYER_LOGO
  }

  doRender(camera) {
    if (consts.GAME_PAUSED) return

    const { ctx } = g
    ctx.globalAlpha = this.alpha

    ctx.wrap(() => {
      this.cancelCameraOffset(camera)

      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, consts.CANVAS_WIDTH, consts.CANVAS_HEIGHT)

      ctx.translate(
        evaluate(consts.CANVAS_WIDTH / 2),
        evaluate(consts.CANVAS_HEIGHT / 3),
      )
      ctx.renderLargeText([
        [nomangle('P'), 192, -30],
        [nomangle('ATH'), 96, 30],
        [nomangle('TO'), 36, 20],
        [nomangle('G'), 192],
        [nomangle('LORY'), 96],
      ])
    })

    for (const player of this.scene.category('player')) {
      player.doRender(camera)
      if (consts.BEATEN) ctx.renderCrown(player)
    }
  }
}
