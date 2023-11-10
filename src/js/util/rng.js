export default class RNG {
  constructor() {
    this.index = 0
    this.elements = Array.apply(null, Array(50)).map(() => Math.random())
  }

  next(min = 0, max = 1) {
    return (
      this.elements[this.index++ % this.elements.length] * (max - min) + min
    )
  }

  reset() {
    this.index = 0
  }
}
