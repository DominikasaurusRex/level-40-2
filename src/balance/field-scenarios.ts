import type { CombatantDefinition } from '@/types/combatant'
import type { Player } from '@/types/player'
import type { Weapon } from '@/types/weapon'
import { maxHpForPlayerLevel } from '@/data/player-hp-curve'
import { skillsForPlayer } from '@/data/skill-progression'
import { resolveWeaponsForLevel, weapons } from '@/data/weapons'
import { balancePlayerPower } from '@/balance/__tests__/helpers/player-power'

const EXPECTED_BADGES = 0

export interface FieldBuild {
  name: string
  ownedSkillChoiceIds: string[]
  level5SkillChoiceId: string
}

export interface FieldScenario {
  name: string
  build: FieldBuild
  weapon: Weapon
}

export const fieldBuilds: FieldBuild[] = [
  { name: 'Power Strike', ownedSkillChoiceIds: ['strike', 'strike-power'], level5SkillChoiceId: 'strike-quick' },
  { name: 'Quick Strike', ownedSkillChoiceIds: ['strike', 'strike-quick'], level5SkillChoiceId: 'strike-double' },
  { name: 'Fortified Guard', ownedSkillChoiceIds: ['guard', 'guard-fortify'], level5SkillChoiceId: 'guard-quick' },
  { name: 'Evasion Guard', ownedSkillChoiceIds: ['guard', 'guard-evasion'], level5SkillChoiceId: 'guard-quick' },
  { name: 'Quick Guard', ownedSkillChoiceIds: ['guard', 'guard-quick'], level5SkillChoiceId: 'guard-fortify' },
  { name: 'Greater Heal', ownedSkillChoiceIds: ['heal', 'heal-greater'], level5SkillChoiceId: 'heal-quick' },
  { name: 'Quick Heal', ownedSkillChoiceIds: ['heal', 'heal-quick'], level5SkillChoiceId: 'heal-regeneration' },
  { name: 'Strike + Guard', ownedSkillChoiceIds: ['strike', 'guard'], level5SkillChoiceId: 'strike-power' },
  { name: 'Strike + Heal', ownedSkillChoiceIds: ['strike', 'heal'], level5SkillChoiceId: 'strike-quick' },
  { name: 'Guard + Heal', ownedSkillChoiceIds: ['guard', 'heal'], level5SkillChoiceId: 'guard-quick' },
]

export const fieldScenarios: FieldScenario[] = fieldBuilds.flatMap(build =>
  weapons.map(weapon => ({
    name: `${build.name} / ${weapon.name}`,
    build,
    weapon,
  })),
)

export function fieldPlayerDefinition(
  level: number,
  build: FieldBuild,
  weapon: Weapon,
): CombatantDefinition {
  const maxHp = maxHpForPlayerLevel.get(level)
  if (maxHp === undefined) throw new Error(`No player HP data for level ${level}`)

  const power = balancePlayerPower(level, EXPECTED_BADGES)
  const resolvedWeapons = resolveWeaponsForLevel(level, power)
  const resolvedWeapon = resolvedWeapons.find(candidate => candidate.slot === weapon.slot)!

  const player: Player = {
    level,
    xp: 0,
    power,
    ownedSkillChoiceIds: [
      ...build.ownedSkillChoiceIds,
      ...(level >= 5 ? [build.level5SkillChoiceId] : []),
    ],
    weapons: resolvedWeapons,
    equippedWeaponSlot: resolvedWeapon.slot!,
    combatant: {
      name: `Level ${level} ${build.name}`,
      maxHp,
      weapon: resolvedWeapon,
      skills: [],
    },
  }
  player.combatant.skills = skillsForPlayer(player)
  return player.combatant
}
