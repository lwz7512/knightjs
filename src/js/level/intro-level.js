import consts from '../constants.js'
import { globals as g } from '../globals.js'
import { nomangle } from '../macros.js'
import { TWO_PI, rnd, distP } from '../math.js'
import { firstItem } from '../util/first-item.js'
import Level from './level.js'
import Interpolator from '../entities/interpolator.js'
import { CharacterController } from '../ai/character-controller.js'
import Tree from '../entities/props/tree.js'
import Label from '../entities/ui/label.js'
import Logo from '../entities/ui/logo.js'
import Fade from '../entities/ui/fade.js'
import Announcement from '../entities/ui/announcement.js'
import Instruction from '../entities/ui/instruction.js'
import Exposition from '../entities/ui/exposition.js'
import { PlayerController } from '../entities/characters/player.js'
import DummyEnemy from '../entities/characters/dummy-enemy.js'
import { createEnemyType } from '../entities/characters/enemy.js'
import CharacterOffscreenIndicator from '../entities/characters/character-offscreen-indicator.js'
import CharacterHUD from '../entities/characters/character-hud.js'
import { playSong } from '../sound/song.js'

export default class IntroLevel extends Level {
  constructor() {
    super()

    const { scene } = this

    for (let r = 0; r < 1; r += 1 / 15) {
      const tree = scene.add(new Tree())
      tree.noRegen = true
      tree.x = Math.cos(r * TWO_PI) * 600 + rnd(-20, 20)
      tree.y = Math.sin(r * TWO_PI) * 600 + rnd(-20, 20)
    }

    const camera = firstItem(scene.category('camera'))
    camera.zoom = 3
    camera.cycle(99)

    const player = firstItem(scene.category('player'))
    player.health = consts.LARGE_INT
    player.setController(new CharacterController())

    this.buildMain(player, camera)
  } // end of constructor

  async buildMain(player, camera) {
    // Respawn when leaving the area
    // NOTE: can not use this line...cause game no welcome screen
    // await this.ready(player)

    console.log(`>> main scene ..`)

    await this.mainScence(player, camera)

    console.log(`>> start game ..`)

    await this.startGame()
  }

  /**
   * FIXME: later...
   * @deprecated
   * @param {*} player
   */
  async ready(player) {
    while (true) {
      await this.scene.waitFor(() => distP(player.x, player.y, 0, 0) > 650)
      await this.respawn(0, 0)
    }
  }

  /**
   *
   * @param {Player} player
   * @param {Camera} camera
   */
  async mainScence(player, camera) {
    const logo = this.scene.add(new Logo())
    const fade = this.scene.add(new Fade())
    await this.scene.add(new Interpolator(fade, 'alpha', 1, 0, 2)).await()

    const msg = this.scene.add(new Instruction())
    msg.text = nomangle('[CLICK] to follow the path')
    await new Promise((r) => (onclick = r))
    msg.text = ''

    // FIXME: ...then uncomment
    playSong()

    g.can.style[nomangle('cursor')] = 'none'

    player.setController(new PlayerController())
    await this.scene.add(new Interpolator(logo, 'alpha', 1, 0, 2)).await()
    await camera.zoomTo(1)

    this.scene.add(new Announcement(nomangle('Prologue')))

    // Movement tutorial
    msg.text = nomangle('Use [ARROW KEYS] or [WASD] to move')
    await this.scene.waitFor(() => distP(player.x, player.y, 0, 0) > 200)
    logo.remove()

    msg.text = ''

    console.log(`>> show arrow & keyboard hint!`)

    await this.scene.delay(1)

    console.log(`>> start repeat...`)

    // Roll tutorial
    await this.repeat(
      msg,
      nomangle('Press [SPACE] or [CTRL] to roll'),
      async () => {
        await this.scene.waitFor(
          () => player.stateMachine.state.dashAngle !== undefined,
        )
        await this.scene.waitFor(
          () => player.stateMachine.state.dashAngle === undefined,
        )
      },
      3,
    )

    console.log(`>>> attack count..`)

    // Attack tutorial
    const totalAttackCount = () =>
      Array.from(this.scene.category('enemy')).reduce(
        (acc, enemy) => enemy.damageCount + acc,
        0,
      )

    for (let r = 0; r < 1; r += 1 / 5) {
      const enemy = this.scene.add(new DummyEnemy())
      enemy.x = Math.cos(r * TWO_PI) * 200
      enemy.y = Math.sin(r * TWO_PI) * 200
      enemy.poof()
    }

    await this.repeat(
      msg,
      nomangle('[LEFT CLICK] to strike a dummy'),
      async () => {
        const initial = totalAttackCount()
        await this.scene.waitFor(() => totalAttackCount() > initial)
      },
      10,
    )

    // Charge tutorial
    await this.repeat(
      msg,
      nomangle('Hold [LEFT CLICK] to charge a heavy attack'),
      async () => {
        await this.scene.waitFor(
          () => player.stateMachine.state.attackPreparationRatio >= 1,
        )

        const initial = totalAttackCount()
        await this.scene.waitFor(() => totalAttackCount() > initial)
      },
      3,
    )

    // Shield tutorial
    const SwordArmorEnemy = createEnemyType({
      sword: true,
      armor: true,
      attackCount: 1,
    })
    const enemy = this.scene.add(new SwordArmorEnemy())
    enemy.health = consts.LARGE_INT
    enemy.x = camera.x + consts.CANVAS_WIDTH / 2 / camera.zoom + 20
    enemy.y = -99
    this.scene.add(new CharacterOffscreenIndicator(enemy))

    await this.repeat(
      msg,
      nomangle('Hold [RIGHT CLICK] or [SHIFT] to block attacks'),
      async () => {
        const initial = player.parryCount
        await this.scene.waitFor(() => player.parryCount > initial)
      },
      3,
    )

    this.scene.add(new CharacterHUD(enemy))

    enemy.health = enemy.maxHealth = 100
    msg.text = nomangle('Now slay them!')
    await this.scene.waitFor(() => enemy.health <= 0)

    msg.text = ''
    await this.scene.delay(1)

    await this.scene.add(new Interpolator(fade, 'alpha', 0, 1, 2)).await()

    const expo = this.scene.add(
      new Exposition([
        nomangle('1254 AD'),
        nomangle(
          'The Kingdom of Syldavia is being invaded by the Northern Empire.',
        ),
        nomangle('The Syldavian army is outnumbered and outmatched.'),
        nomangle('One lone soldier decides to take on the emperor himself.'),
      ]),
    )

    await this.scene.delay(15)

    await this.scene.add(new Interpolator(expo, 'alpha', 1, 0, 2)).await()

    // use level manager
    this.goto('gameplay')
  }

  async startGame() {
    const enemy = this.scene.add(new DummyEnemy())
    enemy.y = -550
    enemy.poof()

    const label = this.scene.add(new Label(nomangle('Skip')))
    label.y = enemy.y - 30
    label.infinite = true

    while (true) {
      console.log(`>>> dead looping...`)
      const { damageCount } = enemy
      await this.scene.waitFor(() => enemy.damageCount > damageCount)
      console.log(`>>> after waiting for...`)
      if (confirm(nomangle('Skip intro?'))) {
        console.log(`## goto level: gameplay`)
        this.levelMan.goLevel('gameplay')
      }
    }
  }

  async repeat(msg, instruction, script, count) {
    for (let i = 0; i < count; i++) {
      msg.text = instruction + ' (' + i + '/' + count + ')'
      await script()
    }

    msg.text = instruction + ' (' + count + '/' + count + ')'

    await this.scene.delay(1)
    msg.text = ''
    await this.scene.delay(1)
  }
}
