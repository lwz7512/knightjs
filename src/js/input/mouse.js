// MOUSE_DOWN = false;
// MOUSE_RIGHT_DOWN = false;
// MOUSE_POSITION = {x: 0, y: 0};

import { globals as g, w } from '../globals.js'

w.onmousedown = (evt) =>
  evt.button == 2 ? (g.MOUSE_RIGHT_DOWN = true) : (g.MOUSE_DOWN = true)
w.onmouseup = (evt) =>
  evt.button == 2 ? (g.MOUSE_RIGHT_DOWN = false) : (g.MOUSE_DOWN = false)
w.onmousemove = (evt) => getEventPosition(evt, g.can, g.MOUSE_POSITION)

w.oncontextmenu = (evt) => evt.preventDefault()

export const getEventPosition = (event, can, out) => {
  if (!can) return
  const canvasRect = can.getBoundingClientRect()
  out.x = ((event.pageX - canvasRect.left) / canvasRect.width) * can.width
  out.y = ((event.pageY - canvasRect.top) / canvasRect.height) * can.height
}
