/**
 * New customized functions towards canvas rendering context object
 *
 * @typedef CanvasContextExtend
 * @property {function(number, boolean, number): void} slice slice method
 * @property {function(function): void} wrap wrap method
 * @property {function(function): void} withShadow with shadow method
 * @property {function(number): number} resolveColor reolove color value
 * @property {function(array): void} renderLargeText draw large text
 * @property {function(string): void} renderInstruction draw instructions
 * @property {function(): void} renderSword draw sward
 * @property {function(): void} renderAxe draw axe
 * @property {function(): void} renderShield draw shield
 * @property {function(Entity, number): void} renderLegs draw legs
 * @property {function(object, number, number): void} renderChest draw chest
 * @property {function(object, number, number): void} renderHead draw head
 * @property {function(): void} renderCrown draw crown
 * @property {function(): void} renderStick draw stick
 * @property {function(object, number, function): void} renderArm draw arm
 * @property {function(object, number): void} renderArmAndShield draw arm & shield
 * @property {function(object, number): void} renderExhaustion draw exhaustion
 * @property {function(object): void} renderAttackIndicator draw indicator
 * @property {function(object): void} renderExclamation draw exclamation
 *
 */

/**
 * @typedef {CanvasRenderingContext2D & CanvasContextExtend} KnightCanvasContext
 */

/**
 * @typedef Scene
 * @property {function(): void} render rendering all the entities of current scene
 */

/**
 * @typedef LevelManager
 * @property {function(string): void} goLevel set to next level by name
 * @property {function(...object): void} restart recreate current level with new arguments
 */

/**
 * @typedef Level
 * @property {Scene} scene scene instance of level
 * @property {LevelManager} manager inject a level manager instance
 * @property {function(number): void} cycle loop function of one level
 */

/**
 * Global Game Context Object
 *
 * @typedef {object} GlobalGameContext
 * @property {AudioContext} audioCtx - audio context
 * @property {HTMLElement} can - html canvas
 * @property {KnightCanvasContext} ctx - canvas context
 * @property {boolean} GAME_PAUSED - if game paused
 * @property {boolean} BEATEN - if player is beaten
 * @property {boolean} MOUSE_RIGHT_DOWN - if mouse right down
 * @property {boolean} MOUSE_DOWN - if mouse id pressed
 * @property {object} MOUSE_POSITION - mouse postion
 * @property {number} inputMode - input mode
 * @property {Level} level - global game level instance
 */

/**
 * Game Entity Type
 *
 * @typedef Entity
 * @property {object} scene scene of current entity lives in
 * @property {number} x horizontal position
 * @property {number} y vertical position
 * @property {number} z z index, aka layer that render this entity
 * @property {number} rotation rotation angle
 * @property {number} age life span
 * @property {array} categories categories list...
 * @property {object} rng whats this?
 * @property {number} renderPadding padding for rendering
 * @property {boolean} affectedBySpeedRatio if affected by speed ratio
 * @property {function(): boolean} inWater if is in water
 * @property {function(number): void} cycle calculate entity age
 * @property {function(): void} render render function to draw this entity
 * @property {function(): void} doRender abstract function
 * @property {function(): void} remove remove entity from scene
 * @property {function(object): void} cancelCameraOffset process camera offset
 */

/**
 * Player
 *
 * @typedef Player
 * @property {object} stateMachine state machine of scene
 * @property {function(): void} setController set player controller
 *
 */
