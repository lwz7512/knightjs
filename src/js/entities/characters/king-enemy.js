import Enemy from './enemy.js'
import { globals as g } from '../../globals.js'
import consts from '../../constants.js'
import { characterStateMachine } from '../../state-machine.js'

export default class KingEnemy extends Enemy {
  constructor() {
    super()
    const { ctx } = g
    this.gibs = [() => ctx.renderSword(), () => ctx.renderShield()]

    this.health = this.maxHealth = 600
    this.strength = 40
    this.baseSpeed = 100

    this.stateMachine = characterStateMachine({
      entity: this,
      chargeTime: 0.5,
      staggerTime: 0.2,
    })
  }

  renderBody() {
    const { ctx } = g
    ctx.renderAttackIndicator(this)
    ctx.renderLegs(this, '#400')
    ctx.renderArm(this, '#400', () => ctx.renderSword())
    ctx.renderHead(this, consts.COLOR_SKIN)
    ctx.renderCrown(this)
    ctx.renderChest(this, '#900', consts.CHEST_WIDTH_ARMORED)
    ctx.renderArmAndShield(this, '#400')
    ctx.renderExhaustion(this, -70)
    ctx.renderExclamation(this)
  }
}
