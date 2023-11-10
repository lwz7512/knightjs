import consts from '../../constants.js'
import { globals as g } from '../../globals.js'
import Enemy from './enemy.js'

export default class DummyEnemy extends Enemy {
  constructor() {
    super()
    this.categories.push('enemy')

    this.health = consts.LARGE_INT
  }

  renderBody() {
    const { ctx } = g
    ctx.wrap(() => {
      ctx.fillStyle = ctx.resolveColor(consts.COLOR_WOOD)
      ctx.fillRect(-2, 0, 4, -20)
    })
    ctx.renderChest(this, consts.COLOR_WOOD, consts.CHEST_WIDTH_NAKED)
    ctx.renderHead(this, consts.COLOR_WOOD)
  }

  dash() {}
}
