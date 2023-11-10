import constants from './constants.js'
import { globals as g } from './globals.js'
import { DOWN } from './input/keyboard.js'
import { TWO_PI } from './math.js'
import { firstItem } from './util/first-item.js'
import Entity from './entities/entity.js'

export default class Scene {
  constructor() {
    this.entities = new Set()
    this.categories = new Map()
    this.sortedEntities = []

    this.speedRatio = 1
    this.onCycle = new Set()
  }

  add(entity) {
    if (this.entities.has(entity)) return
    this.entities.add(entity)
    // set scence instance to each entity
    entity.scene = this

    this.sortedEntities.push(entity)

    for (const category of entity.categories) {
      if (!this.categories.has(category)) {
        this.categories.set(category, new Set([entity]))
      } else {
        this.categories.get(category).add(entity)
      }
    }

    return entity
  }

  category(category) {
    return this.categories.get(category) || []
  }

  remove(entity) {
    this.entities.delete(entity)

    for (const category of entity.categories) {
      if (this.categories.has(category)) {
        this.categories.get(category).delete(entity)
      }
    }

    const index = this.sortedEntities.indexOf(entity)
    if (index >= 0) this.sortedEntities.splice(index, 1)
  }

  cycle(elapsed) {
    const { DEBUG } = constants
    if (DEBUG && DOWN[70]) elapsed *= 3
    if (DEBUG && DOWN[71]) elapsed *= 0.1
    if (g.GAME_PAUSED) return

    for (const entity of this.entities) {
      entity.cycle(
        elapsed * (entity.affectedBySpeedRatio ? this.speedRatio : 1),
      )
    }

    for (const onCycle of this.onCycle) {
      onCycle()
    }
  }

  pathCurve(x) {
    const main = Math.sin((x * TWO_PI) / 2000) * 200
    const wiggle = Math.sin((x * TWO_PI) / 1000) * 100
    return main + wiggle
  }

  render() {
    const { CANVAS_WIDTH, CANVAS_HEIGHT, THUNDER_INTERVAL } = constants
    const camera = firstItem(this.category('camera'))
    // Background
    g.ctx.fillStyle = '#996'
    g.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Thunder
    if (camera.age % THUNDER_INTERVAL < 0.3 && camera.age % 0.2 < 0.1) {
      g.ctx.wrap(() => {
        g.ctx.globalAlpha = 0.3
        g.ctx.fillStyle = '#fff'
        g.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      })
    }

    g.ctx.wrap(() => {
      g.ctx.scale(camera.appliedZoom, camera.appliedZoom)
      g.ctx.translate(
        CANVAS_WIDTH / 2 / camera.appliedZoom - camera.x,
        CANVAS_HEIGHT / 2 / camera.appliedZoom - camera.y,
      )

      this.sortedEntities.sort((a, b) => a.z - b.z)

      for (const entity of this.sortedEntities) {
        g.ctx.wrap(() => entity.render())
      }
    })
  }

  async waitFor(condition) {
    return new Promise((resolve) => {
      const checker = () => {
        if (condition()) {
          this.onCycle.delete(checker)
          resolve()
        }
      }
      this.onCycle.add(checker)
    })
  }

  async delay(timeout) {
    const entity = this.add(new Entity())
    await this.waitFor(() => entity.age > timeout)
    entity.remove()
  }
}
