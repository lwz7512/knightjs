import Entity from '../entity.js'
import { characterStateMachine } from '../../state-machine.js'
import { AI } from '../../ai/character-controller.js'
import {
  dist,
  angleBetween,
  normalize,
  TWO_PI,
  rnd,
  easeOutQuint,
  pick,
} from '../../math.js'
import { sound } from '../../sound/ZzFXMicro.js'
import { nomangle } from '../../macros.js'
import { firstItem } from '../../util/first-item.js'
import { globals as g } from '../../globals.js'
import constants from '../../constants.js'
import PerfectParry from '../animations/perfect-parry.js'
import ShieldBlock from '../animations/shield-block.js'
import Particle from '../animations/particle.js'
import Label from '../ui/label.js'
import Interpolator from '../interpolator.js'
import Corpse from './corpse.js'

const cameraShake = async (scene) => {
  scene.speedRatio = 0.1

  const camera = firstItem(scene.category('camera'))
  await camera.zoomTo(2)
  await scene.delay(3 * scene.speedRatio)
  await camera.zoomTo(1)
  scene.speedRatio = 1
}

export default class Character extends Entity {
  constructor() {
    super()
    this.categories.push('character', 'obstacle')

    this.renderPadding = 90

    this.facing = 1

    this.health = this.maxHealth = 100

    this.combo = 0

    this.stamina = 1

    this.lastDamage = this.lastStaminaLoss = this.lastComboChange = -9

    this.baseSpeed = 200

    this.strikeRadiusX = 80
    this.strikeRadiusY = 40

    this.magnetRadiusX = this.magnetRadiusY = 0

    this.collisionRadius = 30

    this.strength = 100
    this.damageCount = this.parryCount = 0

    this.staminaRecoveryDelay = 99

    this.setController(this.ai)

    this.gibs = []

    this.controls = {
      force: 0,
      angle: 0,
      // 'shield': false,
      // 'attack': false,
      aim: { x: 0, y: 0 },
      // 'dash': false,
    }

    this.stateMachine = characterStateMachine({
      entity: this,
    })
  }
  // TODO: whats this?
  setController(controller) {
    this.controller = controller
    this.controller.start(this)
  }

  get ai() {
    return new AI()
  }

  getColor(color) {
    return this.age - this.lastDamage < 0.1 ? '#fff' : color
  }

  cycle(elapsed) {
    super.cycle(elapsed)

    this.renderAge = this.age * (this.inWater ? 0.5 : 1)

    this.stateMachine.cycle(elapsed)

    this.controller.cycle(elapsed)

    if (this.inWater && this.controls.force) {
      this.loseStamina(elapsed * 0.2)
    }

    const speed = this.stateMachine.state.speedRatio * this.baseSpeed

    this.x +=
      Math.cos(this.controls.angle) * this.controls.force * speed * elapsed
    this.y +=
      Math.sin(this.controls.angle) * this.controls.force * speed * elapsed

    this.facing = Math.sign(this.controls.aim.x - this.x) || 1

    // Collisions with other characters and obstacles
    for (const obstacle of this.scene.category('obstacle')) {
      if (obstacle === this || dist(this, obstacle) > obstacle.collisionRadius)
        continue
      const angle = angleBetween(this, obstacle)
      this.x = obstacle.x - Math.cos(angle) * obstacle.collisionRadius
      this.y = obstacle.y - Math.sin(angle) * obstacle.collisionRadius
    }

    // Stamina regen
    if (
      this.age - this.lastStaminaLoss > this.staminaRecoveryDelay ||
      this.stateMachine.state.exhausted
    ) {
      this.stamina = Math.min(1, this.stamina + elapsed * 0.3)
    }

    // Combo reset
    if (this.age - this.lastComboChange > 5) {
      this.updateCombo(-99)
    }
  }

  updateCombo(value) {
    this.combo = Math.max(0, this.combo + value)
    this.lastComboChange = this.age
  }

  isStrikable(victim, radiusX, radiusY) {
    return this.strikability(victim, radiusX, radiusY, Math.PI / 2) > 0
  }

  isWithinRadii(character, radiusX, radiusY) {
    return (
      Math.abs(character.x - this.x) < radiusX &&
      Math.abs(character.y - this.y) < radiusY
    )
  }

  strikability(victim, radiusX, radiusY, fov) {
    if (victim === this || !radiusX || !radiusY) return 0

    const angleToVictim = angleBetween(this, victim)
    const aimAngle = angleBetween(this, this.controls.aim)
    const angleScore =
      1 - Math.abs(normalize(angleToVictim - aimAngle)) / (fov / 2)

    const dX = Math.abs(this.x - victim.x)
    const adjustedDY = Math.abs(this.y - victim.y) / (radiusY / radiusX)

    const adjustedDistance = Math.hypot(dX, adjustedDY)
    const distanceScore = 1 - adjustedDistance / radiusX

    return distanceScore < 0 || angleScore < 0
      ? 0
      : distanceScore + Math.pow(angleScore, 3)
  }

  pickVictims(radiusX, radiusY, fov) {
    return Array.from(this.scene.category(this.targetTeam)).filter(
      (victim) => this.strikability(victim, radiusX, radiusY, fov) > 0,
    )
  }

  pickVictim(radiusX, radiusY, fov) {
    return this.pickVictims(radiusX, radiusY, fov).reduce((acc, other) => {
      if (!acc) return other

      return this.strikability(other, radiusX, radiusX, fov) >
        this.strikability(acc, radiusX, radiusY, fov)
        ? other
        : acc
    }, null)
  }

  lunge() {
    const victim = this.pickVictim(
      this.magnetRadiusX,
      this.magnetRadiusY,
      Math.PI / 2,
    )
    victim
      ? this.dash(
          angleBetween(this, victim),
          Math.max(0, dist(this, victim) - this.strikeRadiusY / 2),
          0.1,
        )
      : this.dash(angleBetween(this, this.controls.aim), 40, 0.1)
  }

  strike(relativeStrength) {
    sound(...[0.1, , 400, 0.1, 0.01, , 3, 0.92, 17, , , , , 2, , , , 1.04])

    for (const victim of this.pickVictims(
      this.strikeRadiusX,
      this.strikeRadiusY,
      TWO_PI,
    )) {
      const angle = angleBetween(this, victim)
      if (victim.stateMachine.state.shielded) {
        victim.facing = Math.sign(this.x - victim.x) || 1
        victim.parryCount++

        // Push back
        this.dash(angle + Math.PI, 20, 0.1)

        if (victim.stateMachine.state.perfectParry) {
          // Perfect parry, victim gets stamina back, we lose ours
          victim.stamina = 1
          victim.updateCombo(1)
          victim.displayLabel(nomangle('Perfect Block!'))

          const animation = this.scene.add(new PerfectParry())
          animation.x = victim.x
          animation.y = victim.y - 30

          this.perfectlyBlocked = true // Disable "exhausted" label
          this.loseStamina(1)

          for (const parryVictim of this.scene.category(victim.targetTeam)) {
            if (
              victim.isWithinRadii(
                parryVictim,
                victim.strikeRadiusX * 2,
                victim.strikeRadiusY * 2,
              )
            ) {
              parryVictim.dash(angleBetween(victim, parryVictim), 100, 0.2)
            }
          }

          cameraShake(this.scene)

          sound(
            ...[
              2.14,
              ,
              1e3,
              0.01,
              0.2,
              0.31,
              3,
              3.99,
              ,
              0.9,
              ,
              ,
              0.08,
              1.9,
              ,
              ,
              0.22,
              0.34,
              0.12,
            ],
          )
        } else {
          // Regular parry, victim loses stamina
          victim.loseStamina((relativeStrength * this.strength) / 100)
          victim.displayLabel(nomangle('Blocked!'))

          const animation = this.scene.add(new ShieldBlock())
          animation.x = victim.x
          animation.y = victim.y - 30

          sound(
            ...[
              2.03,
              ,
              200,
              ,
              0.04,
              0.12,
              1,
              1.98,
              ,
              ,
              ,
              ,
              ,
              -2.4,
              ,
              ,
              0.1,
              0.59,
              0.05,
              0.17,
            ],
          )
        }
      } else {
        victim.damage(~~(this.strength * relativeStrength))
        victim.dash(angle, this.strength * relativeStrength, 0.1)

        // Regen a bit of health after a kill
        if (!victim.health) {
          this.heal(this.maxHealth * 0.1)
        }

        this.updateCombo(1)

        const impactX = victim.x + rnd(-20, 20)
        const impactY = victim.y - 30 + rnd(-20, 20)
        const size = rnd(1, 2)

        for (let i = 0; i < 20; i++) {
          this.scene.add(
            new Particle(
              '#900',
              [size, size + rnd(3, 6)],
              [impactX, impactX + rnd(-30, 30)],
              [impactY, impactY + rnd(-30, 30)],
              rnd(0.2, 0.4),
            ),
          )
        }
      }
    }
  }

  displayLabel(text, color) {
    if (this.lastLabel) this.lastLabel.remove()

    this.lastLabel = this.scene.add(new Label(text, color))
    this.lastLabel.x = this.x
    this.lastLabel.y = this.y - 90
  }

  loseStamina(amount) {
    this.stamina = Math.max(0, this.stamina - amount)
    this.lastStaminaLoss = this.age
  }

  damage(amount) {
    this.health = Math.max(0, this.health - amount)
    this.lastDamage = this.age
    this.damageCount++

    if (!this.stateMachine.state.exhausted)
      this.loseStamina((amount / this.maxHealth) * 0.3)
    this.updateCombo(-99)
    this.displayLabel('' + amount, this.damageLabelColor)

    // Death
    if (!this.health) this.die()
  }

  heal() {}

  doRender() {
    const { inWater, renderAge } = this
    const { ctx } = g
    ctx.translate(this.x, this.y)

    if (constants.DEBUG && constants.DEBUG_CHARACTER_RADII) {
      ctx.wrap(() => {
        ctx.lineWidth = 10
        ctx.strokeStyle = '#f00'
        ctx.globalAlpha = 0.1
        ctx.beginPath()
        ctx.ellipse(0, 0, this.strikeRadiusX, this.strikeRadiusY, 0, 0, TWO_PI)
        ctx.stroke()

        ctx.beginPath()
        ctx.ellipse(0, 0, this.magnetRadiusX, this.magnetRadiusY, 0, 0, TWO_PI)
        ctx.stroke()
      })
    }

    const orig = ctx.resolveColor || ((x) => x)
    // NOTE: rewrite a new color resolver?
    ctx.resolveColor = (x) => this.getColor(orig(x))

    ctx.withShadow(() => {
      if (inWater) {
        ctx.beginPath()
        ctx.rect(-150, -150, 300, 150)
        ctx.clip()

        ctx.translate(0, 10)
      }

      let { facing } = this
      const { dashAngle } = this.stateMachine.state
      if (dashAngle !== undefined) {
        facing = Math.sign(Math.cos(dashAngle))

        ctx.translate(0, -30)
        ctx.rotate(
          (this.stateMachine.state.age / constants.PLAYER_DASH_DURATION) *
            facing *
            TWO_PI,
        )
        ctx.translate(0, 30)
      }

      ctx.scale(facing, 1)

      ctx.wrap(() => this.renderBody(renderAge))
    })

    if (constants.DEBUG) {
      ctx.fillStyle = '#fff'
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 3
      ctx.textAlign = nomangle('center')
      ctx.textBaseline = nomangle('middle')
      ctx.font = nomangle('12pt Courier')

      const bits = []
      if (constants.DEBUG_CHARACTER_STATE) {
        bits.push(
          ...[
            nomangle('State: ') + this.stateMachine.state.constructor.name,
            nomangle('HP: ') + ~~this.health + '/' + this.maxHealth,
          ],
        )
      }

      if (constants.DEBUG_CHARACTER_AI) {
        bits.push(...[nomangle('AI: ') + this.controller.constructor.name])
      }

      if (constants.DEBUG_CHARACTER_STATS) {
        bits.push(
          ...[
            nomangle('Speed: ') + this.baseSpeed,
            nomangle('Strength: ') + this.strength,
            nomangle('Aggro: ') + this.aggression,
          ],
        )
      }

      let y = -90
      for (const text of bits.reverse()) {
        ctx.strokeText(text, 0, y)
        ctx.fillText(text, 0, y)

        y -= 20
      }
    }
  }

  dash(angle, distance, duration) {
    this.scene.add(
      new Interpolator(
        this,
        'x',
        this.x,
        this.x + Math.cos(angle) * distance,
        duration,
      ),
    )
    this.scene.add(
      new Interpolator(
        this,
        'y',
        this.y,
        this.y + Math.sin(angle) * distance,
        duration,
      ),
    )
  }

  die() {
    const duration = 1

    const gibs = this.gibs.concat(
      [true, false].map((sliceUp) => () => {
        g.ctx.slice(30, sliceUp, 0.5)
        g.ctx.translate(0, 30)
        this.renderBody()
      }),
    )

    for (const step of gibs) {
      const bit = this.scene.add(new Corpse(step))
      bit.x = this.x
      bit.y = this.y

      const angle =
        angleBetween(this, this.controls.aim) +
        Math.PI +
        (rnd(-1, 1) * Math.PI) / 4
      const distance = rnd(30, 60)
      this.scene.add(
        new Interpolator(
          bit,
          'x',
          bit.x,
          bit.x + Math.cos(angle) * distance,
          duration,
          easeOutQuint,
        ),
      )
      this.scene.add(
        new Interpolator(
          bit,
          'y',
          bit.y,
          bit.y + Math.sin(angle) * distance,
          duration,
          easeOutQuint,
        ),
      )
      this.scene.add(
        new Interpolator(
          bit,
          'rotation',
          0,
          pick([-1, 1]) * rnd(Math.PI / 4, Math.PI),
          duration,
          easeOutQuint,
        ),
      )
    }

    this.poof()

    this.displayLabel(nomangle('Slain!'), this.damageLabelColor)

    this.remove()

    sound(
      ...[
        2.1,
        ,
        400,
        0.03,
        0.1,
        0.4,
        4,
        4.9,
        0.6,
        0.3,
        ,
        ,
        0.13,
        1.9,
        ,
        0.1,
        0.08,
        0.32,
      ],
    )
  }

  poof() {
    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * TWO_PI
      const dist = Math.random() * 40

      const x = this.x + Math.cos(angle) * dist
      const y = this.y - 30 + Math.sin(angle) * dist

      this.scene.add(
        new Particle(
          '#fff',
          [10, 20],
          [x, x + rnd(-20, 20)],
          [y, y + rnd(-20, 20)],
          rnd(0.5, 1),
        ),
      )
    }
  }
}
