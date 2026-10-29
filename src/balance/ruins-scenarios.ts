import type { CombatantDefinition } from '@/types/combatant'
import type { Player } from '@/types/player'
import type { WeaponSlot } from '@/types/weapon'
import { maxHpForPlayerLevel } from '@/data/player-hp-curve'
import { skillsForPlayer } from '@/data/skill-progression'
import { resolveWeaponsForLevel, weapons } from '@/data/weapons'
import { balancePlayerPower } from '@/balance/__tests__/helpers/player-power'

const EXPECTED_BADGES = 4

export interface RuinsBuild {
  name: string
  ownedSkillChoiceIds: string[]
  level16SkillChoiceId: string
}

export interface RuinsScenario {
  name: string
  build: RuinsBuild
  weaponSlot: WeaponSlot
}

export const ruinsBuilds: RuinsBuild[] = [
  { name: 'Counter into Stunning Strike', ownedSkillChoiceIds: ['strike', 'strike-power', 'guard', 'guard-fortify', 'guard-counter'], level16SkillChoiceId: 'strike-stun' },
  { name: 'Counter into Evasion', ownedSkillChoiceIds: ['strike', 'strike-power', 'guard', 'guard-fortify', 'guard-counter'], level16SkillChoiceId: 'guard-evasion' },
  { name: 'Recovery into Offensive Care', ownedSkillChoiceIds: ['guard', 'guard-quick', 'heal', 'heal-greater', 'guard-recovery'], level16SkillChoiceId: 'heal-safeguard' },
  { name: 'Recovery into Quick Heal', ownedSkillChoiceIds: ['guard', 'guard-quick', 'heal', 'heal-greater', 'guard-recovery'], level16SkillChoiceId: 'heal-quick' },
  { name: 'Power Bleeding Strike into Guard', ownedSkillChoiceIds: ['strike', 'strike-quick', 'strike-double', 'strike-bleed', 'strike-power'], level16SkillChoiceId: 'guard' },
  { name: 'Bleeding Strike into Fortified Guard', ownedSkillChoiceIds: ['strike', 'strike-quick', 'strike-double', 'strike-bleed', 'guard'], level16SkillChoiceId: 'guard-fortify' },
  { name: 'Greater Cleanse Heal into Guard', ownedSkillChoiceIds: ['heal', 'heal-quick', 'heal-regeneration', 'heal-cleanse', 'heal-greater'], level16SkillChoiceId: 'guard' },
  { name: 'Cleanse Heal into Quick Guard', ownedSkillChoiceIds: ['heal', 'heal-quick', 'heal-regeneration', 'heal-cleanse', 'guard'], level16SkillChoiceId: 'guard-quick' },
  { name: 'Counter Prerequisites into Counter', ownedSkillChoiceIds: ['strike', 'strike-power', 'guard', 'guard-fortify', 'heal'], level16SkillChoiceId: 'guard-counter' },
  { name: 'Evasion Guard + Greater Quick Heal', ownedSkillChoiceIds: ['guard', 'guard-evasion', 'heal', 'heal-greater', 'heal-quick'], level16SkillChoiceId: 'guard-quick' },
]

const weaponSlots = weapons.map(weapon => weapon.slot!)

export const ruinsScenarios: RuinsScenario[] = ruinsBuilds.flatMap(build =>
  weaponSlots.map(weaponSlot => ({
    name: `${build.name} / ${weaponSlot[0]!.toUpperCase()}${weaponSlot.slice(1)}`,
    build,
    weaponSlot,
  })),
)

export function ruinsPlayerDefinition(
  level: number,
  build: RuinsBuild,
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
      ...(level >= 16 ? [build.level16SkillChoiceId] : []),
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
