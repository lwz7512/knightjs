import { globals as g } from '../globals.js'
import constants from '../constants.js'
import { evaluate } from '../macros.js'
import { firstItem } from '../util/first-item.js'
import { isBetween } from '../math.js'
import RNG from '../util/rng.js'

export default class Entity {
  _scene = null

  constructor() {
    this.x = this.y = this.rotation = this.age = 0
    this.categories = []

    this.rng = new RNG()

    this.renderPadding = Infinity

    this.affectedBySpeedRatio = true
  }

  set scene(scene) {
    this._scene = scene
  }

  get scene() {
    return this._scene
  }

  get z() {
    return this.y
  }

  get inWater() {
    if (!this.scene) return false
    let contained = false
    for (const water of this.scene.category('water')) {
      if (water.contains(this)) {
        contained = true
        break
      }
    }
    return contained
  }

  cycle(elapsed) {
    this.age += elapsed
  }

  render() {
    const { CANVAS_WIDTH, CANVAS_HEIGHT } = constants
    const camera = firstItem(this.scene.category('camera'))
    if (
      isBetween(
        camera.x - CANVAS_WIDTH / 2 - this.renderPadding,
        this.x,
        camera.x + CANVAS_WIDTH / 2 + this.renderPadding,
      ) &&
      isBetween(
        camera.y - CANVAS_HEIGHT / 2 - this.renderPadding,
        this.y,
        camera.y + CANVAS_HEIGHT / 2 + this.renderPadding,
      )
    ) {
      this.rng.reset()
      this.doRender(camera)
    }
  }

  doRender(camera) {}

  remove() {
    this.scene.remove(this)
  }

  cancelCameraOffset(camera) {
    const { CANVAS_WIDTH, CANVAS_HEIGHT } = constants
    g.ctx.translate(camera.x, camera.y)
    g.ctx.scale(1 / camera.appliedZoom, 1 / camera.appliedZoom)
    g.ctx.translate(evaluate(-CANVAS_WIDTH / 2), evaluate(-CANVAS_HEIGHT / 2))
  }
}
