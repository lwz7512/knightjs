import { firstItem } from '../util/first-item.js'
import { TWO_PI } from '../math.js'
import { angleBetween } from '../math.js'

export class CharacterController {
  /**
   * remember the entity, might by a `Player`
   * @param {Entity} entity
   */
  start(entity) {
    this.entity = entity
  }

  // get description() {
  //     return this.constructor.name;
  // }

  cycle() {}
}

export class AI extends CharacterController {
  start(entity) {
    super.start(entity)
    return new Promise((resolve, reject) => {
      this.doResolve = resolve
      this.doReject = reject
    })
  }

  cycle() {
    const player = firstItem(this.entity.scene.category('player'))
    if (player) {
      this.update(player)
    }
  }

  update(player) {}

  resolve() {
    const { doResolve } = this
    this.onDone()
    if (doResolve) doResolve()
  }

  reject(error) {
    const { doReject } = this
    this.onDone()
    if (doReject) doReject(error)
  }

  onDone() {
    this.doReject = null
    this.doReject = null
  }
}

export class EnemyAI extends AI {
  constructor() {
    super()
    this.ais = new Set()
  }

  cycle(elapsed) {
    super.cycle(elapsed)

    for (const ai of this.ais.values()) {
      ai.cycle(elapsed)
    }
  }

  // get description() {
  //     return Array.from(this.ais).map(ai => ai.description).join('+');
  // }

  async start(entity) {
    super.start(entity)
    await this.doStart(entity)
  }

  async doStart() {
    // implement in subclasses
  }

  update(player) {
    this.entity.controls.aim.x = player.x
    this.entity.controls.aim.y = player.y
  }

  startAI(ai) {
    return this.race([ai])
  }

  async race(ais) {
    try {
      await Promise.race(
        ais.map((ai) => {
          this.ais.add(ai)
          return ai.start(this.entity)
        }),
      )
    } finally {
      for (const ai of ais) {
        ai.reject(Error())
        ai.resolve() // Allow the AI to clean up
        this.ais.delete(ai)
      }
    }
  }

  async sequence(ais) {
    for (const ai of ais) {
      await this.startAI(ai)
    }
  }
}

export class Wait extends AI {
  constructor(duration) {
    super()
    this.duration = duration
  }

  start(entity) {
    this.endTime = entity.age + this.duration
    return super.start(entity)
  }

  update() {
    if (this.entity.age > this.endTime) {
      this.resolve()
    }
  }
}

export class Timeout extends AI {
  constructor(duration) {
    super()
    this.duration = duration
  }

  start(entity) {
    this.endTime = entity.age + this.duration
    return super.start(entity)
  }

  update() {
    if (this.entity.age > this.endTime) {
      this.reject(Error())
    }
  }
}

export class BecomeAggressive extends AI {
  update() {
    const tracker = firstItem(
      this.entity.scene.category('aggressivity-tracker'),
    )
    if (tracker.requestAggression(this.entity)) {
      this.resolve()
    }
  }
}

export class BecomePassive extends AI {
  update() {
    const tracker = firstItem(
      this.entity.scene.category('aggressivity-tracker'),
    )
    tracker.cancelAggression(this.entity)
    this.resolve()
  }
}

export class ReachPlayer extends AI {
  constructor(radiusX, radiusY) {
    super()
    this.radiusX = radiusX
    this.radiusY = radiusY
    this.angle = Math.random() * TWO_PI
  }

  update(player) {
    const { controls } = this.entity

    controls.force = 0

    if (
      !this.entity.isStrikable(player, this.radiusX, this.radiusY, Math.PI / 2)
    ) {
      controls.force = 1
      controls.angle = angleBetween(this.entity, {
        x: player.x + Math.cos(this.angle) * this.radiusX,
        y: player.y + Math.sin(this.angle) * this.radiusY,
      })
    } else {
      this.resolve()
    }
  }
}

export class Attack extends AI {
  constructor(chargeRatio) {
    super()
    this.chargeRatio = chargeRatio
  }

  update() {
    const { controls } = this.entity

    controls.attack = true

    if (
      this.entity.stateMachine.state.attackPreparationRatio >= this.chargeRatio
    ) {
      // Attack was prepared, release!
      controls.attack = false
      this.resolve()
    }
  }
}

export class RetreatAI extends AI {
  constructor(radiusX, radiusY) {
    super()
    this.radiusX = radiusX
    this.radiusY = radiusY
  }

  update(player) {
    this.entity.controls.force = 0

    if (
      this.entity.isStrikable(player, this.radiusX, this.radiusY, Math.PI / 2)
    ) {
      // Get away from the player
      this.entity.controls.force = 1
      this.entity.controls.angle = angleBetween(player, this.entity)
    } else {
      this.resolve()
    }
  }

  onDone() {
    this.entity.controls.force = 0
  }
}

export class HoldShield extends AI {
  update() {
    this.entity.controls.shield = true
  }

  onDone() {
    this.entity.controls.shield = false
  }
}

export class Dash extends AI {
  update() {
    this.entity.controls.dash = true
  }

  onDone() {
    this.entity.controls.dash = false
  }
}
