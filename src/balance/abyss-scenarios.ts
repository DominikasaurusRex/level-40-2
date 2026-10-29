import type { CombatantDefinition } from '@/types/combatant'
import type { Player } from '@/types/player'
import type { WeaponSlot } from '@/types/weapon'
import { maxHpForPlayerLevel } from '@/data/player-hp-curve'
import { skillsForPlayer } from '@/data/skill-progression'
import { resolveWeaponsForLevel, weapons } from '@/data/weapons'
import { balancePlayerPower } from '@/balance/__tests__/helpers/player-power'

const EXPECTED_BADGES = 7

export interface AbyssBuild {
  name: string
  ownedSkillChoiceIds: string[]
  level25SkillChoiceId: string
  level27SkillChoiceId: string
}

export interface AbyssScenario {
  name: string
  build: AbyssBuild
  weaponSlot: WeaponSlot
}

export const abyssBuilds: AbyssBuild[] = [
  {
    name: 'Stunning Strike into Bleeding Strike',
    ownedSkillChoiceIds: ['strike', 'strike-power', 'guard', 'guard-fortify', 'guard-counter', 'strike-stun', 'strike-quick'],
    level25SkillChoiceId: 'strike-double',
    level27SkillChoiceId: 'strike-bleed',
  },
  {
    name: 'Stunning Strike into Quick Evasion Guard',
    ownedSkillChoiceIds: ['strike', 'strike-power', 'guard', 'guard-fortify', 'guard-counter', 'strike-stun', 'guard-evasion'],
    level25SkillChoiceId: 'guard-quick',
    level27SkillChoiceId: 'heal',
  },
  {
    name: 'Offensive Care into Regeneration Cleanse',
    ownedSkillChoiceIds: ['guard', 'guard-quick', 'heal', 'heal-greater', 'guard-recovery', 'heal-safeguard', 'heal-quick'],
    level25SkillChoiceId: 'heal-regeneration',
    level27SkillChoiceId: 'heal-cleanse',
  },
  {
    name: 'Fortified Offensive Care into Evasion Regen',
    ownedSkillChoiceIds: ['guard', 'guard-quick', 'heal', 'heal-greater', 'guard-recovery', 'heal-safeguard', 'guard-fortify'],
    level25SkillChoiceId: 'guard-evasion',
    level27SkillChoiceId: 'heal-quick',
  },
  {
    name: 'Power Bleeding Strike into Counter Stun',
    ownedSkillChoiceIds: ['strike', 'strike-quick', 'strike-double', 'strike-bleed', 'strike-power', 'guard', 'guard-fortify'],
    level25SkillChoiceId: 'guard-counter',
    level27SkillChoiceId: 'strike-stun',
  },
  {
    name: 'Greater Cleanse into Recovery Offensive Care',
    ownedSkillChoiceIds: ['heal', 'heal-quick', 'heal-regeneration', 'heal-cleanse', 'heal-greater', 'guard', 'guard-quick'],
    level25SkillChoiceId: 'guard-recovery',
    level27SkillChoiceId: 'heal-safeguard',
  },
  {
    name: 'Counter + Quick Strike into Stun Double',
    ownedSkillChoiceIds: ['strike', 'strike-power', 'guard', 'guard-fortify', 'guard-counter', 'strike-quick', 'heal'],
    level25SkillChoiceId: 'strike-stun',
    level27SkillChoiceId: 'strike-double',
  },
  {
    name: 'Recovery + Quick Heal into Offensive Care Regen',
    ownedSkillChoiceIds: ['guard', 'guard-quick', 'heal', 'heal-greater', 'guard-recovery', 'heal-quick', 'guard-fortify'],
    level25SkillChoiceId: 'heal-safeguard',
    level27SkillChoiceId: 'heal-regeneration',
  },
  {
    name: 'Counter and Recovery',
    ownedSkillChoiceIds: ['strike', 'strike-power', 'guard', 'guard-fortify', 'heal', 'heal-greater', 'guard-quick'],
    level25SkillChoiceId: 'guard-counter',
    level27SkillChoiceId: 'guard-recovery',
  },
  {
    name: 'Bleeding Strike + Regeneration into Cleanse Power',
    ownedSkillChoiceIds: ['strike', 'strike-quick', 'strike-double', 'strike-bleed', 'heal', 'heal-quick', 'heal-regeneration'],
    level25SkillChoiceId: 'heal-cleanse',
    level27SkillChoiceId: 'strike-power',
  },
]

const weaponSlots = weapons.map(weapon => weapon.slot!)

export const abyssScenarios: AbyssScenario[] = abyssBuilds.flatMap(build =>
  weaponSlots.map(weaponSlot => ({
    name: `${build.name} / ${weaponSlot[0]!.toUpperCase()}${weaponSlot.slice(1)}`,
    build,
    weaponSlot,
  })),
)

export function abyssPlayerDefinition(
  level: number,
  build: AbyssBuild,
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
    ownedSkillChoiceIds: [
      ...build.ownedSkillChoiceIds,
      ...(level >= 25 ? [build.level25SkillChoiceId] : []),
      ...(level >= 27 ? [build.level27SkillChoiceId] : []),
    ],
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
