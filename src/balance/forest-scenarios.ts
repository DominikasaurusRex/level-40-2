import type { CombatantDefinition } from '@/types/combatant'
import type { Player } from '@/types/player'
import type { Weapon } from '@/types/weapon'
import { maxHpForPlayerLevel } from '@/data/player-hp-curve'
import { skillsForPlayer } from '@/data/skill-progression'
import { resolveWeapon, resolveWeaponsForLevel, weaponUpgradeForLevel } from '@/data/weapons'
import { balancePlayerPower } from '@/balance/__tests__/helpers/player-power'

const EXPECTED_BADGES = 1

export interface ForestBuild {
  name: string
  ownedSkillChoiceIds: string[]
  level8SkillChoiceId: string
}

export interface ForestScenario {
  name: string
  build: ForestBuild
  weapon: Weapon
}

export const forestBuilds: ForestBuild[] = [
  { name: 'Power + Quick Strike', ownedSkillChoiceIds: ['strike', 'strike-power', 'strike-quick'], level8SkillChoiceId: 'strike-double' },
  { name: 'Double Strike', ownedSkillChoiceIds: ['strike', 'strike-quick', 'strike-double'], level8SkillChoiceId: 'strike-bleed' },
  { name: 'Fortified + Quick Guard', ownedSkillChoiceIds: ['guard', 'guard-fortify', 'guard-quick'], level8SkillChoiceId: 'guard-evasion' },
  { name: 'Evasion + Quick Guard', ownedSkillChoiceIds: ['guard', 'guard-evasion', 'guard-quick'], level8SkillChoiceId: 'guard-fortify' },
  { name: 'Greater + Quick Heal', ownedSkillChoiceIds: ['heal', 'heal-greater', 'heal-quick'], level8SkillChoiceId: 'heal-regeneration' },
  { name: 'Quick + Regeneration Heal', ownedSkillChoiceIds: ['heal', 'heal-quick', 'heal-regeneration'], level8SkillChoiceId: 'heal-cleanse' },
  { name: 'Strike + Guard + Heal', ownedSkillChoiceIds: ['strike', 'guard', 'heal'], level8SkillChoiceId: 'strike-power' },
  { name: 'Power Strike + Guard', ownedSkillChoiceIds: ['strike', 'strike-power', 'guard'], level8SkillChoiceId: 'guard-fortify' },
  { name: 'Strike + Fortified Guard', ownedSkillChoiceIds: ['strike', 'guard', 'guard-fortify'], level8SkillChoiceId: 'strike-power' },
  { name: 'Guard + Greater Heal', ownedSkillChoiceIds: ['guard', 'heal', 'heal-greater'], level8SkillChoiceId: 'guard-quick' },
]

const improvedTier = weaponUpgradeForLevel(6)
if (!improvedTier) throw new Error('No Improved weapon tier configured for Forest')
const improvedWeapons = improvedTier.weapons.map(identity => resolveWeapon(identity, balancePlayerPower(6, EXPECTED_BADGES)))

export const forestScenarios: ForestScenario[] = forestBuilds.flatMap(build =>
  improvedWeapons.map(weapon => ({
    name: `${build.name} / ${weapon.name}`,
    build,
    weapon,
  })),
)

export function forestPlayerDefinition(
  level: number,
  build: ForestBuild,
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
      ...(level >= 8 ? [build.level8SkillChoiceId] : []),
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
