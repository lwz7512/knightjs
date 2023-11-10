// FIXME: ???
let belowLayer = -9990
let aboveLayer = 9990

const CONSTANTS = {
  true: 1,
  false: 0,
  const: 'let',
  null: 0,

  LARGE_INT: 9999,

  CANVAS_WIDTH: 1280,
  CANVAS_HEIGHT: 720,

  DEBUG: true,

  WAVE_COUNT: 8,

  PLAYER_HEAVY_ATTACK_INDEX: 3,
  PLAYER_HEAVY_CHARGE_TIME: 1,
  PLAYER_PERFECT_PARRY_TIME: 0.15,
  PLAYER_DASH_DURATION: 0.3,
  PLAYER_DASH_DISTANCE: 200,
  PLAYER_MAGNET_RADIUS: 250,

  STRIKE_WINDUP: 0.05,
  STRIKE_DURATION: 0.15,

  MAX_AGGRESSION: 6,

  LAYER_CORPSE: belowLayer--,
  LAYER_WATER: belowLayer--,
  LAYER_PATH: belowLayer--,
  LAYER_LOWER_FADE: belowLayer--,

  LAYER_CHARACTER_HUD: aboveLayer++,
  LAYER_PARTICLE: aboveLayer++,
  LAYER_ANIMATIONS: aboveLayer++,
  LAYER_WEATHER: aboveLayer++,
  LAYER_PLAYER_HUD: aboveLayer++,
  LAYER_LOGO: aboveLayer++,
  LAYER_FADE: aboveLayer++,
  LAYER_INSTRUCTIONS: aboveLayer++,

  CHEST_WIDTH_ARMORED: 25,
  CHEST_WIDTH_NAKED: 22,

  COLOR_SKIN: '#fec',
  COLOR_SHIRT: '#753',
  COLOR_LEGS: '#666',
  COLOR_ARMORED_ARM: '#666',
  COLOR_ARMOR: '#ccc',
  COLOR_WOOD: '#634',

  DEBUG_AGGRESSIVITY: false,
  DEBUG_CHARACTER_RADII: false,
  DEBUG_CHARACTER_STATE: false,
  DEBUG_CHARACTER_STATS: false,
  DEBUG_CHARACTER_AI: false,
  DEBUG_PLAYER_MAGNET: false,

  RENDER_PLAYER_ICON: false,
  RENDER_SCREENSHOT: false,

  INPUT_MODE_MOUSE: 0,
  INPUT_MODE_TOUCH: 1,
  INPUT_MODE_GAMEPAD: 2,

  TOUCH_JOYSTICK_RADIUS: 50,
  TOUCH_JOYSTICK_MAX_RADIUS: 150,
  TOUCH_BUTTON_RADIUS: 35,

  RIPPLE_DURATION: 2,
  THUNDER_INTERVAL: 10,

  SONG_VOLUME: 0.5,

  // Fix for my mangler sucking
  'aggressivity-tracker': 'at',
}

export default CONSTANTS
