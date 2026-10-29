import type { Weapon, WeaponSlot } from '@/types/weapon'


export interface WeaponIdentity {
  slot: WeaponSlot
  name: string
  icon?: string
  hits?: number
  cooldown: number
  tierMultiplier: number
}

export interface WeaponDamageFormula {
  powerMultiplier: number
  flatBonus: number
}

export const weaponDamageFormulas: Record<WeaponSlot, WeaponDamageFormula> = {
  dagger: { powerMultiplier: 1, flatBonus: 1 },
  sword: { powerMultiplier: 2.5, flatBonus: 2 },
  axe: { powerMultiplier: 4.5, flatBonus: 4 },
}

export function weaponDamageForPower(slot: WeaponSlot, power: number, tierMultiplier = 1): number {
  const formula = weaponDamageFormulas[slot]
  return Math.round((power * formula.powerMultiplier + formula.flatBonus) * tierMultiplier)
}

export function resolveWeapon(identity: WeaponIdentity, power: number): Weapon {
  return {
    slot: identity.slot,
    name: identity.name,
    icon: identity.icon,
    hits: identity.hits,
    cooldown: identity.cooldown,
    damage: weaponDamageForPower(identity.slot, power, identity.tierMultiplier),
  }
}

export const daggerIdentity: WeaponIdentity = { slot: 'dagger', name: 'Dagger', icon: '/icons/weapons/dagger1.png', hits: 2, cooldown: 3000, tierMultiplier: 1 }
export const swordIdentity: WeaponIdentity = { slot: 'sword', name: 'Sword', icon: '/icons/weapons/sword1.png', cooldown: 3000, tierMultiplier: 1 }
export const hammerIdentity: WeaponIdentity = { slot: 'axe', name: 'Axe', icon: '/icons/weapons/axe1.png', cooldown: 5000, tierMultiplier: 1 }

export const weaponIdentities: WeaponIdentity[] = [daggerIdentity, swordIdentity, hammerIdentity]

export const dagger: Weapon = resolveWeapon(daggerIdentity, 1)
export const sword: Weapon = resolveWeapon(swordIdentity, 1)
export const axe: Weapon = resolveWeapon(hammerIdentity, 1)

export const weapons: Weapon[] = [dagger, sword, axe]

export interface WeaponUpgrade {
  level: number
  tier: string
  weapons: WeaponIdentity[]
}

export const weaponUpgrades: WeaponUpgrade[] = [
  {
    level: 6,
    tier: 'Improved',
    weapons: [
      { slot: 'dagger', name: 'Improved Dagger', icon: '/icons/weapons/dagger2.png', hits: 3, cooldown: 3000, tierMultiplier: 0.8 },
      { slot: 'sword', name: 'Improved Sword', icon: '/icons/weapons/sword2.png', cooldown: 3000, tierMultiplier: 1.15 },
      { slot: 'axe', name: 'Improved Axe', icon: '/icons/weapons/axe2.png', cooldown: 5000, tierMultiplier: 1.25 },
    ],
  },
  {
    level: 13,
    tier: 'Good',
    weapons: [
      { slot: 'dagger', name: 'Good Dagger', icon: '/icons/weapons/dagger3.png', hits: 3, cooldown: 3000, tierMultiplier: 1 },
      { slot: 'sword', name: 'Good Sword', icon: '/icons/weapons/sword3.png', cooldown: 3000, tierMultiplier: 1.32 },
      { slot: 'axe', name: 'Good Axe', icon: '/icons/weapons/axe3.png', cooldown: 5000, tierMultiplier: 1.4 },
    ],
  },
  {
    level: 19,
    tier: 'Great',
    weapons: [
      { slot: 'dagger', name: 'Great Dagger', icon: '/icons/weapons/dagger4.png', hits: 4, cooldown: 3000, tierMultiplier: 1.52 },
      { slot: 'sword', name: 'Great Sword', icon: '/icons/weapons/sword4.png', hits: 2, cooldown: 3000, tierMultiplier: 1.52 },
      { slot: 'axe', name: 'Great Axe', icon: '/icons/weapons/axe4.png', cooldown: 5000, tierMultiplier: 3.04 },
    ],
  },
  {
    level: 24,
    tier: 'Masterwork',
    weapons: [
      { slot: 'dagger', name: 'Masterwork Dagger', icon: '/icons/weapons/dagger5.png', hits: 4, cooldown: 3000, tierMultiplier: 1.75 },
      { slot: 'sword', name: 'Masterwork Sword', icon: '/icons/weapons/sword5.png', hits: 2, cooldown: 3000, tierMultiplier: 1.75 },
      { slot: 'axe', name: 'Masterwork Axe', icon: '/icons/weapons/axe5.png', cooldown: 5000, tierMultiplier: 3.5 },
    ],
  },
  {
    level: 28,
    tier: 'Legendary',
    weapons: [
      { slot: 'dagger', name: 'Legendary Dagger', icon: '/icons/weapons/dagger6.png', hits: 4, cooldown: 3000, tierMultiplier: 2 },
      { slot: 'sword', name: 'Legendary Sword', icon: '/icons/weapons/sword6.png', hits: 2, cooldown: 3000, tierMultiplier: 2 },
      { slot: 'axe', name: 'Legendary Axe', icon: '/icons/weapons/axe6.png', cooldown: 5000, tierMultiplier: 4 },
    ],
  },
]

export function weaponUpgradeForLevel(level: number): WeaponUpgrade | undefined {
  return weaponUpgrades.find(upgrade => upgrade.level === level)
}

export function weaponIdentitiesForLevel(level: number): WeaponIdentity[] {
  const upgrade = [...weaponUpgrades].reverse().find(candidate => candidate.level <= level)
  return upgrade?.weapons ?? weaponIdentities
}

export function resolveWeaponsForLevel(level: number, power: number): Weapon[] {
  return weaponIdentitiesForLevel(level).map(identity => resolveWeapon(identity, power))
}
