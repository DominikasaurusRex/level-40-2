import type { CombatantDefinition } from '@/types/combatant'
import type { Monster } from '@/types/monster'
import type { Player } from '@/types/player'
import type { WeaponSlot } from '@/types/weapon'
import type { DuelResult } from '@/combat/simulator'
import { simulateDuel } from '@/combat/simulator'
import { maxHpForPlayerLevel } from '@/data/player-hp-curve'
import { skillsForPlayer } from '@/data/skill-progression'
import { resolveWeaponsForLevel, weapons } from '@/data/weapons'
import { balancePlayerPower } from '@/balance/__tests__/helpers/player-power'

export interface ProgressionBuild {
  name: string
  ownedSkillChoiceIds: string[]
}

export interface FirstClear {
  level: number
  weaponSlot: WeaponSlot
  result: DuelResult
}

const weaponSlots = weapons.map(weapon => weapon.slot!)

export function progressionPlayerDefinition(
  level: number,
  build: ProgressionBuild,
  weaponSlot: WeaponSlot,
  earnedBadgeCount: number,
): CombatantDefinition {
  const maxHp = maxHpForPlayerLevel.get(level)
  if (maxHp === undefined) throw new Error(`No player HP data for level ${level}`)

  const power = balancePlayerPower(level, earnedBadgeCount)
  const resolvedWeapons = resolveWeaponsForLevel(level, power)
  const weapon = resolvedWeapons.find(candidate => candidate.slot === weaponSlot)
  if (!weapon) throw new Error(`No ${weaponSlot} configured for player level ${level}`)

  const player: Player = {
    level,
    xp: 0,
    power,
    ownedSkillChoiceIds: [...build.ownedSkillChoiceIds],
    weapons: resolvedWeapons,
    equippedWeaponSlot: weaponSlot,
    combatant: {
      name: `Level ${level} ${build.name}`,
      maxHp,
      weapon,
      skills: [],
    },
  }
  player.combatant.skills = skillsForPlayer(player)
  return player.combatant
}

export function findFirstClear(
  build: ProgressionBuild,
  monster: Monster,
  firstLevel: number,
  lastLevel: number,
  earnedBadgeCount: number,
): FirstClear | undefined {
  for (let level = firstLevel; level <= lastLevel; level += 1) {
    for (const weaponSlot of weaponSlots) {
      const result = simulateDuel(
        progressionPlayerDefinition(level, build, weaponSlot, earnedBadgeCount),
        monster.combatant,
      )
      if (result.outcome === 'monster-defeated') return { level, weaponSlot, result }
    }
  }
}
