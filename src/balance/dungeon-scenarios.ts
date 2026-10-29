import type { CombatantDefinition } from '@/types/combatant'
import type { Player } from '@/types/player'
import type { WeaponSlot } from '@/types/weapon'
import { maxHpForPlayerLevel } from '@/data/player-hp-curve'
import { skillsForPlayer } from '@/data/skill-progression'
import { resolveWeaponsForLevel, weapons } from '@/data/weapons'
import { balancePlayerPower } from '@/balance/__tests__/helpers/player-power'

const EXPECTED_BADGES = 5

export interface DungeonBuild {
  name: string
  ownedSkillChoiceIds: string[]
  level21SkillChoiceId: string
}

export interface DungeonScenario {
  name: string
  build: DungeonBuild
  weaponSlot: WeaponSlot
}

export const dungeonBuilds: DungeonBuild[] = [
  { name: 'Stunning Strike into Quick Strike', ownedSkillChoiceIds: ['strike', 'strike-power', 'guard', 'guard-fortify', 'guard-counter', 'strike-stun'], level21SkillChoiceId: 'strike-quick' },
  { name: 'Stunning Strike into Evasion', ownedSkillChoiceIds: ['strike', 'strike-power', 'guard', 'guard-fortify', 'guard-counter', 'strike-stun'], level21SkillChoiceId: 'guard-evasion' },
  { name: 'Offensive Care into Quick Heal', ownedSkillChoiceIds: ['guard', 'guard-quick', 'heal', 'heal-greater', 'guard-recovery', 'heal-safeguard'], level21SkillChoiceId: 'heal-quick' },
  { name: 'Offensive Care into Fortify', ownedSkillChoiceIds: ['guard', 'guard-quick', 'heal', 'heal-greater', 'guard-recovery', 'heal-safeguard'], level21SkillChoiceId: 'guard-fortify' },
  { name: 'Power Bleeding Strike + Guard', ownedSkillChoiceIds: ['strike', 'strike-quick', 'strike-double', 'strike-bleed', 'strike-power', 'guard'], level21SkillChoiceId: 'guard-fortify' },
  { name: 'Bleeding Strike + Fortified Guard', ownedSkillChoiceIds: ['strike', 'strike-quick', 'strike-double', 'strike-bleed', 'guard', 'guard-fortify'], level21SkillChoiceId: 'strike-power' },
  { name: 'Greater Cleanse Heal + Guard', ownedSkillChoiceIds: ['heal', 'heal-quick', 'heal-regeneration', 'heal-cleanse', 'heal-greater', 'guard'], level21SkillChoiceId: 'guard-quick' },
  { name: 'Cleanse Heal + Quick Guard', ownedSkillChoiceIds: ['heal', 'heal-quick', 'heal-regeneration', 'heal-cleanse', 'guard', 'guard-quick'], level21SkillChoiceId: 'heal-greater' },
  { name: 'Counter + Heal into Stunning Strike', ownedSkillChoiceIds: ['strike', 'strike-power', 'guard', 'guard-fortify', 'guard-counter', 'heal'], level21SkillChoiceId: 'strike-stun' },
  { name: 'Recovery + Strike into Offensive Care', ownedSkillChoiceIds: ['guard', 'guard-quick', 'heal', 'heal-greater', 'guard-recovery', 'strike'], level21SkillChoiceId: 'heal-safeguard' },
]

const weaponSlots = weapons.map(weapon => weapon.slot!)

export const dungeonScenarios: DungeonScenario[] = dungeonBuilds.flatMap(build =>
  weaponSlots.map(weaponSlot => ({
    name: `${build.name} / ${weaponSlot[0]!.toUpperCase()}${weaponSlot.slice(1)}`,
    build,
    weaponSlot,
  })),
)

export function dungeonPlayerDefinition(
  level: number,
  build: DungeonBuild,
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
      ...(level >= 21 ? [build.level21SkillChoiceId] : []),
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
