import type { CombatantDefinition } from '@/types/combatant'
import type { Player } from '@/types/player'
import type { WeaponSlot } from '@/types/weapon'
import { maxHpForPlayerLevel } from '@/data/player-hp-curve'
import { skillsForPlayer } from '@/data/skill-progression'
import { resolveWeaponsForLevel, weapons } from '@/data/weapons'
import { balancePlayerPower } from '@/balance/__tests__/helpers/player-power'

const EXPECTED_BADGES = 3

export interface WastelandBuild {
  name: string
  ownedSkillChoiceIds: string[]
}

export interface WastelandScenario {
  name: string
  build: WastelandBuild
  weaponSlot: WeaponSlot
}

export const wastelandBuilds: WastelandBuild[] = [
  { name: 'Power Bleeding Strike', ownedSkillChoiceIds: ['strike', 'strike-quick', 'strike-double', 'strike-bleed', 'strike-power'] },
  { name: 'Bleeding Strike + Guard', ownedSkillChoiceIds: ['strike', 'strike-quick', 'strike-double', 'strike-bleed', 'guard'] },
  { name: 'Counter', ownedSkillChoiceIds: ['strike', 'strike-power', 'guard', 'guard-fortify', 'guard-counter'] },
  { name: 'Recovery', ownedSkillChoiceIds: ['guard', 'guard-quick', 'heal', 'heal-greater', 'guard-recovery'] },
  { name: 'Greater Cleanse Heal', ownedSkillChoiceIds: ['heal', 'heal-quick', 'heal-regeneration', 'heal-cleanse', 'heal-greater'] },
  { name: 'Cleanse Heal + Guard', ownedSkillChoiceIds: ['heal', 'heal-quick', 'heal-regeneration', 'heal-cleanse', 'guard'] },
  { name: 'Power Strike + Fortified Guard + Heal', ownedSkillChoiceIds: ['strike', 'strike-power', 'guard', 'guard-fortify', 'heal'] },
  { name: 'Evasion Guard + Greater Heal', ownedSkillChoiceIds: ['guard', 'guard-evasion', 'heal', 'heal-greater', 'heal-quick'] },
  { name: 'Quick Strike + Quick Guard + Heal', ownedSkillChoiceIds: ['strike', 'strike-quick', 'guard', 'guard-quick', 'heal'] },
]

const weaponSlots = weapons.map(weapon => weapon.slot!)

export const wastelandScenarios: WastelandScenario[] = wastelandBuilds.flatMap(build =>
  weaponSlots.map(weaponSlot => ({
    name: `${build.name} / ${weaponSlot[0]!.toUpperCase()}${weaponSlot.slice(1)}`,
    build,
    weaponSlot,
  })),
)

export function wastelandPlayerDefinition(
  level: number,
  build: WastelandBuild,
  weaponSlot: WeaponSlot,
): CombatantDefinition {
  const maxHp = maxHpForPlayerLevel.get(level)
  if (maxHp === undefined) throw new Error(`No player HP data for level ${level}`)

  const power = balancePlayerPower(level, EXPECTED_BADGES)
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
