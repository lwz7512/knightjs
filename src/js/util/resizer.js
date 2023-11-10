import { w } from '../globals'
import consts from '../constants'
// import { nomangle } from '../macros'

w.onresize = () => {
  let windowWidth = innerWidth,
    windowHeight = innerHeight,
    availableRatio = windowWidth / windowHeight, // available ratio
    canvasRatio = consts.CANVAS_WIDTH / consts.CANVAS_HEIGHT, // base ratio
    appliedWidth,
    appliedHeight
  // containerStyle = nomangle(t).style

  if (availableRatio <= canvasRatio) {
    appliedWidth = windowWidth
    appliedHeight = appliedWidth / canvasRatio
  } else {
    appliedHeight = windowHeight
    appliedWidth = appliedHeight * canvasRatio
  }

  //   containerStyle.width = appliedWidth + 'px'
  //   containerStyle.height = appliedHeight + 'px'
}
