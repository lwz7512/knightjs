import Entity from '../entity.js'
import consts from '../../constants.js'
import { globals as g } from '../../globals.js'
import { staminaGradient, healthGradient } from '../../graphics/gauge.js'
import Gauge from '../../graphics/gauge.js'

export default class CharacterHUD extends Entity {
  constructor(character) {
    super()
    this.character = character

    this.healthGauge = new Gauge(
      () => this.character.health / this.character.maxHealth,
    )
    this.staminaGauge = new Gauge(() => this.character.stamina)
  }

  get z() {
    return consts.LAYER_CHARACTER_HUD
  }

  cycle(elapsed) {
    super.cycle(elapsed)
    this.healthGauge.cycle(elapsed)
    this.staminaGauge.cycle(elapsed)
    if (!this.character.health) this.remove()
  }

  doRender() {
    if (
      this.character.health > 0.5 &&
      this.character.age -
        Math.max(this.character.lastStaminaLoss, this.character.lastDamage) >
        2
    )
      return
    const { ctx } = g
    ctx.translate(this.character.x, this.character.y + 20)
    ctx.wrap(() => {
      ctx.translate(0, 4)
      this.staminaGauge.render(60, 6, staminaGradient, true)
    })
    this.healthGauge.render(80, 5, healthGradient)
  }
}
