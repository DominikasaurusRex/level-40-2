import type { CombatantDefinition } from './combatant'

export interface Monster {
  combatant: CombatantDefinition
  image: string
  spriteScale?: number
  spriteGroundOffset?: number
  spriteWallOffset?: number
  spriteOverflow?: boolean
  xpOrbOffset?: number
  xpOrbRadius?: number
  xp: number
}
