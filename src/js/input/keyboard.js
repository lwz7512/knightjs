import { globals as g, w } from '../globals.js'

export const DOWN = {}

export const cleanupDOWN = () => {
  Object.keys(DOWN).forEach((k) => delete DOWN[k])
  g.MOUSE_RIGHT_DOWN = g.MOUSE_DOWN = false
}

w.onkeydown = (e) => {
  if (e.keyCode == 27 || e.keyCode == 80) {
    g.GAME_PAUSED = !g.GAME_PAUSED
    // setSongVolume(g.GAME_PAUSED ? 0 : g.SONG_VOLUME)
  }
  DOWN[e.keyCode] = true
}
w.onkeyup = (e) => (DOWN[e.keyCode] = false)

// Reset inputs when window loses focus
w.onblur = w.onfocus = () => {
  // DOWN = {}
  cleanupDOWN()
}
