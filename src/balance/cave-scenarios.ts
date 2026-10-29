import type { CombatantDefinition } from '@/types/combatant'
import type { Player } from '@/types/player'
import type { Weapon } from '@/types/weapon'
import { maxHpForPlayerLevel } from '@/data/player-hp-curve'
import { skillsForPlayer } from '@/data/skill-progression'
import { resolveWeapon, resolveWeaponsForLevel, weaponUpgradeForLevel } from '@/data/weapons'
import { balancePlayerPower } from '@/balance/__tests__/helpers/player-power'

const EXPECTED_BADGES = 2

export interface CaveBuild {
  name: string
  ownedSkillChoiceIds: string[]
  level11SkillChoiceId: string
}

export interface CaveScenario {
  name: string
  build: CaveBuild
  weapon: Weapon
}

export const caveBuilds: CaveBuild[] = [
  { name: 'Power + Quick + Double Strike', ownedSkillChoiceIds: ['strike', 'strike-power', 'strike-quick', 'strike-double'], level11SkillChoiceId: 'strike-bleed' },
  { name: 'Bleeding Strike', ownedSkillChoiceIds: ['strike', 'strike-quick', 'strike-double', 'strike-bleed'], level11SkillChoiceId: 'strike-power' },
  { name: 'Fortified + Quick + Evasion Guard', ownedSkillChoiceIds: ['guard', 'guard-fortify', 'guard-quick', 'guard-evasion'], level11SkillChoiceId: 'strike' },
  { name: 'Greater + Quick + Regen Heal', ownedSkillChoiceIds: ['heal', 'heal-greater', 'heal-quick', 'heal-regeneration'], level11SkillChoiceId: 'heal-cleanse' },
  { name: 'Cleanse Heal', ownedSkillChoiceIds: ['heal', 'heal-quick', 'heal-regeneration', 'heal-cleanse'], level11SkillChoiceId: 'heal-greater' },
  { name: 'Counter Prerequisites', ownedSkillChoiceIds: ['strike', 'strike-power', 'guard', 'guard-fortify'], level11SkillChoiceId: 'guard-counter' },
  { name: 'Recovery Prerequisites', ownedSkillChoiceIds: ['guard', 'guard-quick', 'heal', 'heal-greater'], level11SkillChoiceId: 'guard-recovery' },
  { name: 'Strike + Fortified Guard + Heal', ownedSkillChoiceIds: ['strike', 'guard', 'guard-fortify', 'heal'], level11SkillChoiceId: 'strike-power' },
  { name: 'Power Strike + Guard + Heal', ownedSkillChoiceIds: ['strike', 'strike-power', 'guard', 'heal'], level11SkillChoiceId: 'guard-fortify' },
  { name: 'Strike + Greater Heal + Guard', ownedSkillChoiceIds: ['strike', 'guard', 'heal', 'heal-greater'], level11SkillChoiceId: 'guard-quick' },
  { name: 'Evasion Guard + Quick Heal', ownedSkillChoiceIds: ['guard', 'guard-evasion', 'heal', 'heal-quick'], level11SkillChoiceId: 'heal-regeneration' },
]

const improvedTier = weaponUpgradeForLevel(6)
if (!improvedTier) throw new Error('No Improved weapon tier configured for Cave')
const improvedWeapons = improvedTier.weapons.map(identity => resolveWeapon(identity, balancePlayerPower(6, EXPECTED_BADGES)))

export const caveScenarios: CaveScenario[] = caveBuilds.flatMap(build =>
  improvedWeapons.map(weapon => ({
    name: `${build.name} / ${weapon.name}`,
    build,
    weapon,
  })),
)

export function cavePlayerDefinition(
  level: number,
  build: CaveBuild,
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
      ...(level >= 11 ? [build.level11SkillChoiceId] : []),
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
