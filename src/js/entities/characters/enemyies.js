import { createEnemyType } from './enemy.js'

const shield = { shield: true }
const sword = { sword: true, attackCount: 2 }
const stick = { stick: true, attackCount: 3 }
const axe = { axe: true, attackCount: 1 }
const armor = { armor: true }
const superArmor = { superArmor: true }

export const StickEnemy = createEnemyType({ ...stick })
const AxeEnemy = createEnemyType({ ...axe })
const SwordEnemy = createEnemyType({ ...sword })

const SwordArmorEnemy = createEnemyType({ ...sword, ...armor })
const AxeArmorEnemy = createEnemyType({ ...axe, ...armor })

const AxeShieldArmorEnemy = createEnemyType({ ...axe, ...shield, ...armor })
const SwordShieldArmorEnemy = createEnemyType({ ...sword, ...shield, ...armor })
const SwordShieldTankEnemy = createEnemyType({
  ...sword,
  ...shield,
  ...superArmor,
})
export const AxeShieldTankEnemy = createEnemyType({
  ...axe,
  ...shield,
  ...superArmor,
})

const ENEMY_TYPES = [
  // Weapon
  StickEnemy,
  AxeEnemy,
  SwordEnemy,
  // Weapon + armor
  SwordArmorEnemy,
  AxeArmorEnemy,
  // Weapon + armor + shield
  AxeShieldArmorEnemy,
  SwordShieldArmorEnemy,
  // Tank
  SwordShieldTankEnemy,
  AxeShieldTankEnemy,
]

export const WAVE_SETTINGS = [
  ENEMY_TYPES.slice(0, 3),
  ENEMY_TYPES.slice(0, 4),
  ENEMY_TYPES.slice(0, 5),
  ENEMY_TYPES.slice(0, 7),
  ENEMY_TYPES,
]
