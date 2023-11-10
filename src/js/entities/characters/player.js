import constants from '../../constants.js'
import { globals as g } from '../../globals.js'
import { CharacterController } from '../../ai/character-controller.js'
import { createCanvas } from '../../graphics/create-canvas.js'
import { TWO_PI, rnd, angleBetween, dist } from '../../math.js'
import { sound } from '../../sound/ZzFXMicro.js'
import { characterStateMachine } from '../../state-machine.js'
import Particle from '../animations/particle.js'
import { DOWN } from '../../input/keyboard.js'
import { firstItem } from '../../util/first-item.js'
import {
  TOUCH_ATTACK_BUTTON,
  TOUCH_SHIELD_BUTTON,
  TOUCH_DASH_BUTTON,
  TOUCH_JOYSTICK,
} from '../../input/touch.js'
import Character from './character.js'

export default class Player extends Character {
  constructor() {
    super()
    this.categories.push('player')

    this.targetTeam = 'enemy'

    this.score = 0

    this.baseSpeed = 250
    this.strength = 30

    this.staminaRecoveryDelay = 2

    this.magnetRadiusX = this.magnetRadiusY = constants.PLAYER_MAGNET_RADIUS

    this.affectedBySpeedRatio = false

    this.damageLabelColor = '#f00'

    this.gibs = [() => g.ctx.renderSword(), () => g.ctx.renderShield()]

    this.stateMachine = characterStateMachine({
      entity: this,
      chargeTime: constants.PLAYER_HEAVY_CHARGE_TIME,
      perfectParryTime: constants.PLAYER_PERFECT_PARRY_TIME,
      releaseAttackBetweenStrikes: true,
      staggerTime: 0.2,
    })
  }

  get ai() {
    return new PlayerController()
  }

  damage(amount) {
    super.damage(amount)
    sound(
      ...[
        2.07,
        ,
        71,
        0.01,
        0.05,
        0.03,
        2,
        0.14,
        ,
        ,
        ,
        ,
        0.01,
        1.5,
        ,
        0.1,
        0.19,
        0.95,
        0.05,
        0.16,
      ],
    )
  }

  getColor(color) {
    return this.age - this.lastDamage < 0.1 ? '#f00' : super.getColor(color)
  }

  heal(amount) {
    amount = ~~Math.min(this.maxHealth - this.health, amount)
    this.health += amount

    for (let i = amount; --i > 0; ) {
      setTimeout(() => {
        const angle = Math.random() * TWO_PI
        const dist = Math.random() * 40

        const x = this.x + rnd(-10, 10)
        const y = this.y - 30 + Math.sin(angle) * dist

        this.scene.add(
          new Particle(
            '#0f0',
            [5, 10],
            [x, x + rnd(-10, 10)],
            [y, y + rnd(-30, -60)],
            rnd(1, 1.5),
          ),
        )
      }, i * 100)
    }
  }

  render() {
    const FOV_GRADIENT = [0, 255].map((red) =>
      createCanvas(1, 1, (ctx) => {
        const grad = ctx.createRadialGradient(
          0,
          0,
          0,
          0,
          0,
          constants.PLAYER_MAGNET_RADIUS,
        )
        grad.addColorStop(0, 'rgba(' + red + ',0,0,.1)')
        grad.addColorStop(1, 'rgba(' + red + ',0,0,0)')
        return grad
      }),
    )

    const victim = this.pickVictim(
      this.magnetRadiusX,
      this.magnetRadiusY,
      Math.PI / 2,
    )
    if (victim) {
      g.ctx.wrap(() => {
        if (constants.RENDER_SCREENSHOT) return

        g.ctx.globalAlpha = 0.2
        g.ctx.strokeStyle = '#f00'
        g.ctx.lineWidth = 5
        g.ctx.setLineDash([10, 10])
        g.ctx.beginPath()
        g.ctx.moveTo(this.x, this.y)
        g.ctx.lineTo(victim.x, victim.y)
        g.ctx.stroke()
      })
    }

    g.ctx.wrap(() => {
      if (constants.RENDER_SCREENSHOT) return

      g.ctx.translate(this.x, this.y)

      const aimAngle = angleBetween(this, this.controls.aim)
      g.ctx.fillStyle = FOV_GRADIENT[+!!victim]
      g.ctx.beginPath()
      g.ctx.arc(
        0,
        0,
        this.magnetRadiusX,
        aimAngle - Math.PI / 4,
        aimAngle + Math.PI / 4,
      )
      g.ctx.lineTo(0, 0)
      g.ctx.fill()
    })

    if (constants.DEBUG && constants.DEBUG_PLAYER_MAGNET) {
      g.ctx.wrap(() => {
        g.ctx.fillStyle = '#0f0'
        for (
          let x = this.x - this.magnetRadiusX - 20;
          x < this.x + this.magnetRadiusX + 20;
          x += 4
        ) {
          for (
            let y = this.y - this.magnetRadiusY - 20;
            y < this.y + this.magnetRadiusY + 20;
            y += 4
          ) {
            g.ctx.globalAlpha = this.strikability(
              { x, y },
              this.magnetRadiusX,
              this.magnetRadiusY,
              Math.PI / 2,
            )
            g.ctx.fillRect(x - 2, y - 2, 4, 4)
          }
        }
      })
      g.ctx.wrap(() => {
        for (const victim of this.scene.category(this.targetTeam)) {
          const strikability = this.strikability(
            victim,
            this.magnetRadiusX,
            this.magnetRadiusY,
            Math.PI / 2,
          )
          if (!strikability) continue
          g.ctx.lineWidth = strikability * 30
          g.ctx.strokeStyle = '#ff0'
          g.ctx.beginPath()
          g.ctx.moveTo(this.x, this.y)
          g.ctx.lineTo(victim.x, victim.y)
          g.ctx.stroke()
        }
      })
    }

    super.render()
  }

  /**
   * Called in Character/doRender()
   */
  renderBody() {
    g.ctx.renderLegs(this, constants.COLOR_LEGS)
    g.ctx.renderArm(this, constants.COLOR_LEGS, () => g.ctx.renderSword())
    g.ctx.renderHead(this, constants.COLOR_SKIN)
    g.ctx.renderChest(
      this,
      constants.COLOR_ARMOR,
      constants.CHEST_WIDTH_ARMORED,
    )
    g.ctx.renderArmAndShield(this, constants.COLOR_LEGS)
    g.ctx.renderExhaustion(this, -70)
  }
}

export class PlayerController extends CharacterController {
  // get description() {
  //     return 'Player';
  // }

  /**
   * loop the `entity`, aka player to respond different inputs
   */
  cycle() {
    let x = 0,
      y = 0
    if (DOWN[37] || DOWN[65]) x = -1
    if (DOWN[38] || DOWN[87]) y = -1
    if (DOWN[39] || DOWN[68]) x = 1
    if (DOWN[40] || DOWN[83]) y = 1

    const { MOUSE_RIGHT_DOWN, MOUSE_POSITION, inputMode } = g
    const { CANVAS_WIDTH, CANVAS_HEIGHT } = constants

    const camera = firstItem(this.entity.scene.category('camera'))
    if (x || y) this.entity.controls.angle = Math.atan2(y, x)

    // figure out force
    this.entity.controls.force = x || y ? 1 : 0
    // figure out if use shield
    this.entity.controls.shield =
      DOWN[16] || MOUSE_RIGHT_DOWN || TOUCH_SHIELD_BUTTON.down
    // figure out if doing attack
    this.entity.controls.attack = g.MOUSE_DOWN || TOUCH_ATTACK_BUTTON.down
    // figure out if doing dash
    this.entity.controls.dash = DOWN[32] || DOWN[17] || TOUCH_DASH_BUTTON.down
    // ???
    const mouseRelX = (MOUSE_POSITION.x - CANVAS_WIDTH / 2) / (CANVAS_WIDTH / 2)
    const mouseRelY =
      (MOUSE_POSITION.y - CANVAS_HEIGHT / 2) / (CANVAS_HEIGHT / 2)

    this.entity.controls.aim.x =
      this.entity.x + (mouseRelX * CANVAS_WIDTH) / 2 / camera.appliedZoom
    this.entity.controls.aim.y =
      this.entity.y + (mouseRelY * CANVAS_HEIGHT) / 2 / camera.appliedZoom

    if (inputMode == constants.INPUT_MODE_TOUCH) {
      const { touch } = TOUCH_JOYSTICK
      this.entity.controls.aim.x = this.entity.x + (touch.x - TOUCH_JOYSTICK.x)
      this.entity.controls.aim.y = this.entity.y + (touch.y - TOUCH_JOYSTICK.y)
      this.entity.controls.angle = angleBetween(TOUCH_JOYSTICK, touch)
      this.entity.controls.force =
        TOUCH_JOYSTICK.touchIdentifier < 0
          ? 0
          : Math.min(
              1,
              dist(touch, TOUCH_JOYSTICK) / constants.TOUCH_JOYSTICK_RADIUS,
            )
    }
    if (x) this.entity.facing = x
  }
}
