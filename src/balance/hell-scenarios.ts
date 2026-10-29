import type { CombatantDefinition } from '@/types/combatant'
import type { Player } from '@/types/player'
import type { WeaponSlot } from '@/types/weapon'
import { maxHpForPlayerLevel } from '@/data/player-hp-curve'
import { skillsForPlayer } from '@/data/skill-progression'
import { resolveWeaponsForLevel, weapons } from '@/data/weapons'
import { balancePlayerPower } from '@/balance/__tests__/helpers/player-power'

const EXPECTED_BADGES = 6

export interface HellBuild {
  name: string
  ownedSkillChoiceIds: string[]
}

export interface HellScenario {
  name: string
  build: HellBuild
  weaponSlot: WeaponSlot
}

export const hellBuilds: HellBuild[] = [
  { name: 'Stunning + Quick Strike', ownedSkillChoiceIds: ['strike', 'strike-power', 'guard', 'guard-fortify', 'guard-counter', 'strike-stun', 'strike-quick'] },
  { name: 'Stunning Strike + Evasion', ownedSkillChoiceIds: ['strike', 'strike-power', 'guard', 'guard-fortify', 'guard-counter', 'strike-stun', 'guard-evasion'] },
  { name: 'Offensive Care + Quick Heal', ownedSkillChoiceIds: ['guard', 'guard-quick', 'heal', 'heal-greater', 'guard-recovery', 'heal-safeguard', 'heal-quick'] },
  { name: 'Fortified Offensive Care', ownedSkillChoiceIds: ['guard', 'guard-quick', 'heal', 'heal-greater', 'guard-recovery', 'heal-safeguard', 'guard-fortify'] },
  { name: 'Power Bleeding Strike + Fortified Guard', ownedSkillChoiceIds: ['strike', 'strike-quick', 'strike-double', 'strike-bleed', 'strike-power', 'guard', 'guard-fortify'] },
  { name: 'Bleeding Strike + Evasion Guard + Heal', ownedSkillChoiceIds: ['strike', 'strike-quick', 'strike-double', 'strike-bleed', 'guard', 'guard-evasion', 'heal'] },
  { name: 'Greater Cleanse Heal + Quick Guard', ownedSkillChoiceIds: ['heal', 'heal-quick', 'heal-regeneration', 'heal-cleanse', 'heal-greater', 'guard', 'guard-quick'] },
  { name: 'Greater Cleanse Heal + Power Strike', ownedSkillChoiceIds: ['heal', 'heal-quick', 'heal-regeneration', 'heal-cleanse', 'heal-greater', 'strike', 'strike-power'] },
  { name: 'Counter + Quick Strike + Heal', ownedSkillChoiceIds: ['strike', 'strike-power', 'guard', 'guard-fortify', 'guard-counter', 'strike-quick', 'heal'] },
  { name: 'Recovery + Quick Heal + Fortify', ownedSkillChoiceIds: ['guard', 'guard-quick', 'heal', 'heal-greater', 'guard-recovery', 'heal-quick', 'guard-fortify'] },
]

const weaponSlots = weapons.map(weapon => weapon.slot!)

export const hellScenarios: HellScenario[] = hellBuilds.flatMap(build =>
  weaponSlots.map(weaponSlot => ({
    name: `${build.name} / ${weaponSlot[0]!.toUpperCase()}${weaponSlot.slice(1)}`,
    build,
    weaponSlot,
  })),
)

export function hellPlayerDefinition(
  level: number,
  build: HellBuild,
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
