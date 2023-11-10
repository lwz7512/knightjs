import Entity from './entity.js'
import constants from '../constants.js'
import { globals as g } from '../globals.js'
import { nomangle } from '../macros.js'
import { firstItem } from '../util/first-item.js'

export default class AggressivityTracker extends Entity {
  constructor() {
    super()
    this.categories.push('aggressivity-tracker')
    this.currentAggression = 0
    this.aggressive = new Set()
  }

  requestAggression(enemy) {
    this.cancelAggression(enemy)

    const { aggression } = enemy
    if (this.currentAggression + aggression > constants.MAX_AGGRESSION) {
      return
    }

    this.currentAggression += aggression
    this.aggressive.add(enemy)
    return true
  }

  cancelAggression(enemy) {
    if (this.aggressive.has(enemy)) {
      const { aggression } = enemy
      this.currentAggression -= aggression
      this.aggressive.delete(enemy)
    }
  }

  doRender(camera) {
    if (constants.DEBUG && constants.DEBUG_AGGRESSIVITY) {
      g.ctx.fillStyle = '#fff'
      g.ctx.strokeStyle = '#000'
      g.ctx.lineWidth = 5
      g.ctx.textAlign = nomangle('center')
      g.ctx.textBaseline = nomangle('middle')
      g.ctx.font = nomangle('12pt Courier')

      g.ctx.wrap(() => {
        g.ctx.translate(camera.x, camera.y - 100)

        g.ctx.strokeText('Agg: ' + this.currentAggression, 0, 0)
        g.ctx.fillText('Agg: ' + this.currentAggression, 0, 0)
      })

      const player = firstItem(this.scene.category('player'))
      if (!player) return

      for (const enemy of this.aggressive) {
        g.ctx.strokeStyle = '#f00'
        g.ctx.lineWidth = 20
        g.ctx.globalAlpha = 0.1
        g.ctx.beginPath()
        g.ctx.moveTo(enemy.x, enemy.y)
        g.ctx.lineTo(player.x, player.y)
        g.ctx.stroke()
      }
    }
  }
}
