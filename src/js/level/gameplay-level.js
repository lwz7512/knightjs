import Level from './level.js'
import { firstItem } from '../util/first-item.js'
import consts from '../constants.js'
import { globals as g } from '../globals.js'
import Path from '../entities/path.js'
import Tree from '../entities/props/tree.js'
import Water from '../entities/props/water.js'
import { rnd, TWO_PI, pick } from '../math.js'
import PlayerHUD from '../entities/characters/player-hud.js'
import CharacterHUD from '../entities/characters/character-hud.js'
import KingEnemy from '../entities/characters/king-enemy.js'
import { createEnemyAI } from '../entities/characters/enemy.js'
import { WAVE_SETTINGS } from '../entities/characters/enemyies.js'
import CharacterOffscreenIndicator from '../entities/characters/character-offscreen-indicator.js'
import { evaluate, nomangle } from '../macros.js'
import Fade from '../entities/ui/fade.js'
import Interpolator from '../entities/interpolator.js'
import Announcement from '../entities/ui/announcement.js'
import Instruction from '../entities/ui/instruction.js'
import Exposition from '../entities/ui/exposition.js'

export default class GameplayLevel extends Level {
  constructor(waveIndex = 0, score = 0) {
    super()

    const { scene } = this
    const { CANVAS_WIDTH } = consts

    this.waveIndex = waveIndex
    this.waveStartScore = score

    const player = firstItem(scene.category('player'))
    player.x = waveIndex * CANVAS_WIDTH
    player.y = scene.pathCurve(player.x)
    player.score = score

    const camera = firstItem(scene.category('camera'))
    camera.cycle(99)

    this.playerHUD = scene.add(new PlayerHUD(player))
    scene.add(new Path())

    this.buildEnvironment()

    this.buildMain(player, camera)
  } // end of constructor

  buildEnvironment() {
    const { CANVAS_HEIGHT, CANVAS_WIDTH } = consts
    for (let i = 0; i < 15; i++) {
      const tree = this.scene.add(new Tree())
      tree.x = (rnd(-1, 1) * CANVAS_WIDTH) / 2
      tree.y = (rnd(-1, 1) * CANVAS_HEIGHT) / 2
    }

    for (let i = 0; i < 20; i++) {
      const water = this.scene.add(new Water())
      water.width = rnd(100, 200)
      water.height = rnd(200, 400)
      water.rotation = Math.random() * TWO_PI
      water.x = Math.random() * CANVAS_WIDTH * 5
      water.y = Math.random() * CANVAS_HEIGHT * 5
    }
  }

  async buildMain(player, camera) {
    // Respawn when far from the path
    await this.spawnPathCurve(player, camera)

    // Scenario
    await this.mainScenario(player, camera)

    // Game over
    await this.gameOverScene(player, camera)
  }

  /**
   * generate path curve
   *
   */
  async spawnPathCurve(player, camera) {
    const { CANVAS_WIDTH } = consts
    while (true) {
      await this.scene.waitFor(
        () =>
          Math.abs(player.y - this.scene.pathCurve(player.x)) > 1000 ||
          player.x < camera.minX - CANVAS_WIDTH / 2,
      )

      const x = Math.max(camera.minX + CANVAS_WIDTH, player.x)
      await this.respawn(x, this.scene.pathCurve(x))
    }
  }

  async slowMo(player, camera) {
    player.affectedBySpeedRatio = true
    this.scene.speedRatio = 0.2
    await camera.zoomTo(3)
    await this.scene.delay(1.5 * this.scene.speedRatio)
    await camera.zoomTo(1)
    this.scene.speedRatio = 1
    player.affectedBySpeedRatio = false
  }

  spawnWave(enemyCount, enemyTypes, player) {
    const { CANVAS_WIDTH, CANVAS_HEIGHT } = consts
    return Array.apply(null, Array(enemyCount)).map(() => {
      const enemy = this.scene.add(new (pick(enemyTypes))())
      enemy.x = player.x + rnd(-CANVAS_WIDTH / 2, CANVAS_WIDTH / 2)
      enemy.y =
        player.y + pick([-1, 1]) * (evaluate(CANVAS_HEIGHT / 2) + rnd(50, 100))
      this.scene.add(new CharacterHUD(enemy))
      this.scene.add(new CharacterOffscreenIndicator(enemy))
      return enemy
    })
  }

  async gameOverScene(player, camera) {
    await this.scene.waitFor(() => player.health <= 0)

    this.slowMo(player, camera)

    const fade = this.scene.add(new Fade())
    await this.scene
      .add(new Interpolator(fade, 'alpha', 0, 1, 2 * this.scene.speedRatio))
      .await()
    this.scene.speedRatio = 2

    const expo = this.scene.add(
      new Exposition([
        // Story
        pick([
          nomangle('Failing never affected his will, only his score.'),
          nomangle('Giving up was never an option.'),
          nomangle("His first attempts weren't successful."),
          nomangle('After licking his wounds, he resumed his quest.'),
        ]),

        // Tip
        pick([
          nomangle(
            'His shield would not fail him again ([SHIFT] / [RIGHT CLICK])',
          ),
          nomangle('Rolling would help him dodge attacks ([SPACE] / [CTRL])'),
          nomangle('Heavy attacks would be key to his success'),
        ]),
      ]),
    )

    await this.scene.delay(6)
    await this.scene.add(new Interpolator(expo, 'alpha', 1, 0, 2)).await()

    // Start a level where we left off
    this.levelMan.restart(
      this.waveIndex,
      Math.max(0, this.waveStartScore - 5000),
    ) // TODO figure out a value
  }

  async mainScenario(player, camera) {
    // const scene = this.scene
    const { WAVE_COUNT, CANVAS_WIDTH } = consts
    const fade = this.scene.add(new Fade())
    await this.scene.add(new Interpolator(fade, 'alpha', 1, 0, 2)).await()

    this.scene.add(new Announcement(nomangle('The Path')))
    await this.scene.delay(2)

    this.playerHUD.progress = this.playerHUD.progressGauge.displayedValue =
      this.waveIndex / WAVE_COUNT

    let nextWaveX = player.x + CANVAS_WIDTH
    for (; this.waveIndex < WAVE_COUNT; this.waveIndex++) {
      // NOTE: Show progress
      this.showProgress()

      const instruction = this.scene.add(new Instruction())
      await this.scene.delay(10),
        (instruction.text = nomangle('Follow the path to the right'))

      await this.scene.waitFor(() => player.x >= nextWaveX)

      instruction.remove()

      this.waveStartScore = player.score

      this.scene.add(new Announcement(nomangle('Wave ') + (this.waveIndex + 1)))

      const waveEnemies = this.spawnWave(
        3 + this.waveIndex,
        WAVE_SETTINGS[Math.min(WAVE_SETTINGS.length - 1, this.waveIndex)],
      )

      // Wait until all enemies are defeated
      await Promise.all(
        waveEnemies.map((enemy) => this.scene.waitFor(() => enemy.health <= 0)),
      )
      this.slowMo(player, camera)

      this.scene.add(new Announcement(nomangle('Wave Cleared')))

      nextWaveX = player.x + evaluate(CANVAS_WIDTH * 2)
      camera.minX = player.x - CANVAS_WIDTH
    }

    // Last wave, reach the king
    await this.scene.waitFor(() => player.x >= nextWaveX)
    const king = this.scene.add(new KingEnemy())
    king.x = camera.x + CANVAS_WIDTH + 50
    king.y = this.scene.pathCurve(king.x)
    this.scene.add(new CharacterHUD(king))

    await this.scene.waitFor(() => king.x - player.x < 400)
    await this.scene
      .add(new Interpolator(fade, 'alpha', 0, 1, 2 * this.scene.speedRatio))
      .await()

    // Make sure the player is near the king
    player.x = king.x - 400
    player.y = this.scene.pathCurve(player.x)

    const expo = this.scene.add(
      new Exposition([nomangle('At last, he faced the emperor.')]),
    )

    await this.scene.delay(3)
    await this.scene.add(new Interpolator(expo, 'alpha', 1, 0, 2)).await()
    await this.scene.add(new Interpolator(fade, 'alpha', 1, 0, 2)).await()

    // Give the king an AI so they can start fighting
    const aiType = createEnemyAI({
      shield: true,
      attackCount: 3,
    })
    king.setController(new aiType())
    this.scene.add(new CharacterOffscreenIndicator(king))

    // Spawn some mobs
    this.spawnWave(5, WAVE_SETTINGS[WAVE_SETTINGS.length - 1])

    await this.scene.waitFor(() => king.health <= 0)

    player.health = player.maxHealth = 999

    // == global ===
    g.BEATEN = true

    // Final slomo
    await this.slowMo(player, camera)
    await this.scene
      .add(new Interpolator(fade, 'alpha', 0, 1, 2 * this.scene.speedRatio))
      .await()

    // Congrats screen
    const finalExpo = this.scene.add(
      new Exposition([
        nomangle('After an epic fight, the emperor was defeated.'),
        nomangle("Our hero's quest was complete."),
        nomangle('Historians estimate his final score was ') +
          player.score.toLocaleString() +
          '.',
      ]),
    )
    await this.scene
      .add(
        new Interpolator(finalExpo, 'alpha', 0, 1, 2 * this.scene.speedRatio),
      )
      .await()
    await this.scene.delay(9 * this.scene.speedRatio)
    await this.scene
      .add(
        new Interpolator(finalExpo, 'alpha', 1, 0, 2 * this.scene.speedRatio),
      )
      .await()

    // Back to intro ...
    this.goto('intro')
  }

  async showProgress(player) {
    const { WAVE_COUNT } = consts
    await this.scene.delay(1)
    await this.scene
      .add(new Interpolator(this.playerHUD, 'progressAlpha', 0, 1, 1))
      .await()
    this.playerHUD.progress = this.waveIndex / WAVE_COUNT

    // Regen a bit of health
    player.heal(player.maxHealth * 0.5)

    await this.scene.delay(3)
    await this.scene
      .add(new Interpolator(this.playerHUD, 'progressAlpha', 1, 0, 1))
      .await()
  }
}
