import Scene from '../scene.js'
import constants from '../constants.js'
import Camera from '../entities/camera.js'
import AggressivityTracker from '../entities/aggressivity-tracker.js'
import Interpolator from '../entities/interpolator.js'
import { firstItem } from '../util/first-item.js'
import { rnd } from '../math.js'
import { cleanupDOWN } from '../input/keyboard.js'
import Player from '../entities/characters/player.js'
import Fade from '../entities/ui/fade.js'
import Bush from '../entities/props/bush.js'
import Cursor from '../entities/cursor.js'
import Rain from '../entities/animations/rain.js'
import PauseOverlay from '../entities/ui/pause-overlay.js'
import Bird from '../entities/animations/bird.js'
import Grass from '../entities/props/grass.js'
// import LevelManager from './level-manager.js'

/**
 * Level is an example class for my question.
 *
 * @class
 * @constructor
 * @public
 */
export default class Level {
  constructor() {
    /**
     * @type {LevelManager}
     */
    this.levelMan = null

    this.scene = new Scene()

    this.scene.add(new Camera())

    cleanupDOWN()

    this.scene.add(new AggressivityTracker())

    const player = this.scene.add(new Player())
    this.scene.add(new Cursor(player))

    this.scene.add(new Rain())
    this.scene.add(new PauseOverlay())

    for (let i = 2; i--; ) this.scene.add(new Bird())

    for (let i = 0; i < 400; i++) {
      const grass = new Grass()
      grass.x = rnd(-2, 2) * constants.CANVAS_WIDTH
      grass.y = rnd(-2, 2) * constants.CANVAS_HEIGHT
      this.scene.add(grass)
    }

    for (let i = 0; i < 20; i++) {
      const bush = new Bush()
      bush.x = Math.random() * 10000
      this.scene.add(bush)
    }
  }

  /**
   * abstract level setter
   *
   * @param {LevelManager} man LevelManager
   */
  set manager(man) {
    this.levelMan = man
  }

  /**
   * turn to next level by name
   *
   * @param {string} levelName
   */
  goto(levelName) {
    this.levelMan.goLevel(levelName)
  }

  cycle(elapsed) {
    this.scene.cycle(elapsed)
  }

  async respawn(x, y) {
    const fade = this.scene.add(new Fade())
    await this.scene.add(new Interpolator(fade, 'alpha', 0, 1, 1)).await()
    const player = firstItem(this.scene.category('player'))
    const camera = firstItem(this.scene.category('camera'))
    player.x = x
    player.y = y
    camera.cycle(999)
    await this.scene.add(new Interpolator(fade, 'alpha', 1, 0, 1)).await()
    fade.remove()
  }
}
