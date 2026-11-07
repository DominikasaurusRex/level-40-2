import type { CombatantDefinition } from './combatant'
import type { Weapon, WeaponSlot } from './weapon'

export interface Player {
  combatant: CombatantDefinition
  level: number
  xp: number
  power: number
  ownedSkillChoiceIds: string[]
  weapons: Weapon[]
  equippedWeaponSlot: WeaponSlot
}

export function equippedWeapon(player: Player): Weapon {
  return player.weapons.find(weapon => weapon.slot === player.equippedWeaponSlot)!
}
