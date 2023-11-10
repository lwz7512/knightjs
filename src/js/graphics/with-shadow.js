import { canvasPrototype, globals as g } from '../globals.js'

canvasPrototype.resolveColor = (x) => x

canvasPrototype.withShadow = function (render) {
  this.wrap(() => {
    this.isShadow = true
    this.resolveColor = () => 'rgba(0,0,0,.2)'

    g.ctx.scale(1, 0.5)
    g.ctx.transform(1, 0, 0.5, 1, 0, 0) // shear the context
    render()
  })

  this.wrap(() => {
    this.isShadow = false
    render()
  })
}
