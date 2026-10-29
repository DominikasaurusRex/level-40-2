import { describe, expect, it } from 'vitest'
import type { CombatantDefinition } from '@/types/combatant'
import type { Player } from '@/types/player'
import type { WeaponSlot } from '@/types/weapon'
import type { Monster } from '@/types/monster'
import { maxHpForPlayerLevel } from '@/data/player-hp-curve'
import { skillsForPlayer } from '@/data/skill-progression'
import { resolveWeaponsForLevel } from '@/data/weapons'
import { wastelandMonsters } from '@/data/monster/wasteland-monsters'
import { ruinsMonsters } from '@/data/monster/ruins-monsters'
import { hellMonsters } from '@/data/monster/hell-monsters'
import { simulateDuel } from '@/combat/simulator'
import { balancePlayerPower } from '@/balance/__tests__/helpers/player-power'

const REPORT = import.meta.env.VITE_BALANCE_REPORT === '1' || import.meta.env.MODE === 'balance'

const capstoneMawBenchmark: Monster = {
  image: '',
  xp: 0,
  combatant: {
    name: 'Capstone Maw benchmark',
    maxHp: 1344,
    weapon: { name: 'Basic Attack', damage: 4, hits: 3, cooldown: 2600 },
    skills: [
      {
        id: 'gnashing-teeth',
        name: 'Gnashing Teeth',
        category: 'attack',
        cooldown: 8000,
        effects: Array.from({ length: 5 }, () => ({ type: 'dmg' as const, amount: 5 })),
      },
      {
        id: 'ravenous-bite',
        name: 'Ravenous Bite',
        category: 'attack',
        cooldown: 11000,
        effects: [
          { type: 'dmg', amount: 32 },
          { type: 'bleed', amountPerTick: 6, tickInterval: 1000, duration: 4000 },
        ],
      },
    ],
  },
}

function playerDefinition(
  level: number,
  earnedBadgeCount: number,
  ownedSkillChoiceIds: string[],
  weaponSlot: WeaponSlot,
): CombatantDefinition {
  const power = balancePlayerPower(level, earnedBadgeCount)
  const weapons = resolveWeaponsForLevel(level, power)
  const weapon = weapons.find(candidate => candidate.slot === weaponSlot)!
  const player: Player = {
    level,
    xp: 0,
    power,
    ownedSkillChoiceIds,
    weapons,
    equippedWeaponSlot: weaponSlot,
    combatant: { name: 'Capstone benchmark', maxHp: maxHpForPlayerLevel.get(level)!, weapon, skills: [] },
  }
  player.combatant.skills = skillsForPlayer(player)
  return player.combatant
}

function compareChoice(
  monster: Monster,
  level: number,
  badges: number,
  prerequisiteIds: string[],
  choiceId: string,
  weaponSlot: WeaponSlot = 'sword',
) {
  return {
    before: simulateDuel(playerDefinition(level, badges, prerequisiteIds, weaponSlot), monster.combatant),
    after: simulateDuel(playerDefinition(level, badges, [...prerequisiteIds, choiceId], weaponSlot), monster.combatant),
  }
}

describe('deep skill-tree choice value', () => {
  it('makes each deep choice materially useful in its intended matchup', () => {
    const doubleStrike = compareChoice(
      wastelandMonsters[0]!,
      12,
      3,
      ['strike', 'strike-quick'],
      'strike-double',
      'axe',
    )
    const bleedingStrike = compareChoice(
      ruinsMonsters[1]!,
      16,
      4,
      ['strike', 'strike-quick', 'strike-double'],
      'strike-bleed',
    )
    const stunningStrike = compareChoice(
      capstoneMawBenchmark,
      21,
      7,
      ['strike', 'strike-power', 'guard', 'guard-fortify', 'guard-counter'],
      'strike-stun',
    )
    const offensiveCare = compareChoice(
      capstoneMawBenchmark,
      24,
      7,
      ['guard', 'guard-quick', 'heal', 'heal-greater', 'guard-recovery'],
      'heal-safeguard',
    )
    const cleanse = compareChoice(
      hellMonsters[3]!,
      24,
      6,
      ['heal', 'heal-quick', 'heal-regeneration'],
      'heal-cleanse',
    )

    if (REPORT) {
      console.table(Object.entries({ doubleStrike, bleedingStrike, stunningStrike, offensiveCare, cleanse })
        .map(([choice, { before, after }]) => ({
          choice,
          before: `${before.outcome} ${before.durationMs}ms / ${before.playerHp} HP`,
          after: `${after.outcome} ${after.durationMs}ms / ${after.playerHp} HP`,
        })))
    }

    expect(doubleStrike.after.durationMs).toBeLessThan(doubleStrike.before.durationMs)
    expect(bleedingStrike.after.durationMs).toBeLessThan(bleedingStrike.before.durationMs)
    expect(stunningStrike.after.playerHp).toBeGreaterThan(stunningStrike.before.playerHp)
    expect(offensiveCare.after.durationMs).toBeLessThan(offensiveCare.before.durationMs)
    expect(cleanse.after.durationMs).toBeGreaterThan(cleanse.before.durationMs)
  })
})
