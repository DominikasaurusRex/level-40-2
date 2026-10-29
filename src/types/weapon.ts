import type { Skill } from './skill'

export type WeaponSlot = 'dagger' | 'sword' | 'axe'

export interface Weapon {
  slot?: WeaponSlot
  name: string
  icon?: string
  damage: number
  hits?: number
  cooldown: number
}

export function basicAttackSkill(weapon: Weapon): Skill {
  const hits = weapon.hits ?? 1
  return {
    id: 'basic-attack',
    name: weapon.name,
    category: 'attack',
    cooldown: weapon.cooldown,
    effects: Array.from({ length: hits }, () => ({ type: 'dmg', amount: weapon.damage })),
  }
}
