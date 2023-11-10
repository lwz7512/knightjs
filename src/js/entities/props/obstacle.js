import Entity from '../entity.js'

export default class Obstacle extends Entity {
  constructor() {
    super()
    this.categories.push('obstacle')
  }
}
