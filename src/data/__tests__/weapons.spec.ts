import { describe, expect, it } from 'vitest'
import { resolveWeaponsForLevel, weaponDamageForPower, weaponUpgrades } from '@/data/weapons'
import type { WeaponSlot } from '@/types/weapon'

describe('weapon tier damage', () => {
  it('applies the tier multiplier after the slot formula', () => {
    expect(weaponDamageForPower('dagger', 5, 1.32)).toBe(8)
    expect(weaponDamageForPower('sword', 5, 1.32)).toBe(19)
    expect(weaponDamageForPower('axe', 5, 1.32)).toBe(35)
  })

  it('gives every successive tier more sustained damage at the same Power', () => {
    const slots: WeaponSlot[] = ['dagger', 'sword', 'axe']

    for (const slot of slots) {
      const damageRates = [
        (() => {
          const weapon = resolveWeaponsForLevel(1, 10).find(candidate => candidate.slot === slot)!
          return weapon.damage * (weapon.hits ?? 1) / weapon.cooldown
        })(),
        ...weaponUpgrades.map(upgrade => {
          const identity = upgrade.weapons.find(weapon => weapon.slot === slot)!
          return weaponDamageForPower(slot, 10, identity.tierMultiplier)
            * (identity.hits ?? 1) / identity.cooldown
        }),
      ]

      expect(damageRates).toEqual([...damageRates].sort((a, b) => a - b))
      expect(new Set(damageRates).size).toBe(damageRates.length)
    }
  })

  it('resolves the accepted acquisition-level damage values before badges', () => {
    expect(resolveWeaponsForLevel(1, 1).map(weapon => weapon.damage)).toEqual([2, 5, 9])
    expect(resolveWeaponsForLevel(6, 2).map(weapon => weapon.damage)).toEqual([2, 8, 16])
    expect(resolveWeaponsForLevel(13, 5).map(weapon => weapon.damage)).toEqual([6, 19, 37])
    expect(resolveWeaponsForLevel(19, 7).map(weapon => weapon.damage)).toEqual([12, 30, 108])
    expect(resolveWeaponsForLevel(24, 8).map(weapon => weapon.damage)).toEqual([16, 39, 140])
    expect(resolveWeaponsForLevel(28, 10).map(weapon => weapon.damage)).toEqual([22, 54, 196])
  })

  it('keeps the Great-tier extra hits on every later tier', () => {
    expect(resolveWeaponsForLevel(6, 2).map(weapon => weapon.hits ?? 1)).toEqual([3, 1, 1])
    expect(resolveWeaponsForLevel(13, 5).map(weapon => weapon.hits ?? 1)).toEqual([3, 1, 1])
    expect(resolveWeaponsForLevel(19, 7).map(weapon => weapon.hits ?? 1)).toEqual([4, 2, 1])
    expect(resolveWeaponsForLevel(24, 8).map(weapon => weapon.hits ?? 1)).toEqual([4, 2, 1])
    expect(resolveWeaponsForLevel(28, 10).map(weapon => weapon.hits ?? 1)).toEqual([4, 2, 1])
  })

  it('gives Great and later Hammers twice the ordinary tier multiplier', () => {
    for (const upgrade of weaponUpgrades.filter(candidate => candidate.level >= 19)) {
      const sword = upgrade.weapons.find(weapon => weapon.slot === 'sword')!
      const axe = upgrade.weapons.find(weapon => weapon.slot === 'axe')!
      expect(axe.tierMultiplier).toBe(sword.tierMultiplier * 2)
    }
  })

  it('keeps sustained DPS strictly ordered Dagger below Sword below Axe', () => {
    const levelAndPower = [[1, 1], [6, 2], [13, 5], [19, 7], [24, 8], [28, 10]]

    for (const [level, power] of levelAndPower) {
      const weapons = resolveWeaponsForLevel(level!, power!)
      const dagger = weapons.find(weapon => weapon.slot === 'dagger')!
      const sword = weapons.find(weapon => weapon.slot === 'sword')!
      const axe = weapons.find(weapon => weapon.slot === 'axe')!
      const daggerDps = dagger.damage * (dagger.hits ?? 1) / dagger.cooldown
      const swordDps = sword.damage * (sword.hits ?? 1) / sword.cooldown
      const hammerDps = axe.damage * (axe.hits ?? 1) / axe.cooldown

      expect(daggerDps).toBeLessThan(swordDps)
      expect(hammerDps).toBeGreaterThan(swordDps)
    }
  })
})
