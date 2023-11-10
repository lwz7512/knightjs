import { globals as g } from './globals.js'
import IntroLevel from './level/intro-level.js'
import GameplayLevel from './level/gameplay-level.js'
import ScreenshotLevel from './level/screenshot-level.js'

export default class LevelManager {
  constructor() {
    /** @type {Object.<string, Class>} */
    this.levels = {
      intro: IntroLevel,
      gameplay: GameplayLevel,
      screenshot: ScreenshotLevel,
    }

    /** @type {Level} */
    this.currentLevel = null

    /** @type {string} */
    this.levelName = null
  }

  /**
   * set current level by name
   *
   * @param {string} name
   */
  goLevel(name) {
    const LevelClass = this.levels[name]
    if (LevelClass) {
      // save current level name for the case of restart
      this.levelName = name
      // create level instance
      this.currentLevel = new LevelClass()
      // inject manger instance
      this.currentLevel.manager = this
      // expose level instance
      g.level = this.currentLevel // save current level instance globaly
    } else {
      console.warn(`Got unknown level: ${name}`)
    }
  }

  /**
   * Retart current level by new arguments
   *
   * @param  {...any} args
   * @returns
   */
  restart(...args) {
    if (!this.levelName) return

    const LevelClass = this.levels[this.levelName]
    if (!LevelClass) return

    // create level instance
    this.currentLevel = new LevelClass(...args)
    // inject manger instance
    this.currentLevel.manager = this
    // expose level instance
    g.level = this.currentLevel // save current level instance globaly
  }

  /**
   * get active level
   *
   * @returns {Level}
   */
  get level() {
    return this.currentLevel
  }
}
