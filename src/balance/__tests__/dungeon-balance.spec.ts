import { describe, expect, it } from 'vitest'
import { dungeonMonsters } from '@/data/monster/dungeon-monsters'
import { dungeonBuilds, dungeonPlayerDefinition, dungeonScenarios } from '@/balance/dungeon-scenarios'
import { simulateDuel, simulateFarm } from '@/combat/simulator'

const FARM_DURATION_MS = 5 * 60 * 1000
const REPORT = import.meta.env.VITE_BALANCE_REPORT === '1' || import.meta.env.MODE === 'balance'
const normalMonsters = dungeonMonsters.slice(0, 4)
const dragon = dungeonMonsters[4]!
const dragonBenchmarkLevels = [19, 20, 22]

const farmResults = dungeonScenarios.map(scenario => ({
  scenario,
  results: normalMonsters.map(monster => ({
    monster,
    result: simulateFarm(
      dungeonPlayerDefinition(19, scenario.build, scenario.weaponSlot),
      monster.combatant,
      monster.xp,
      FARM_DURATION_MS,
    ),
  })),
}))

const dragonResults = dragonBenchmarkLevels.flatMap(level =>
  dungeonScenarios.map(scenario => ({
    level,
    scenario,
    result: simulateDuel(
      dungeonPlayerDefinition(level, scenario.build, scenario.weaponSlot),
      dragon.combatant,
    ),
  })),
)

function duelLabel(result: (typeof dragonResults)[number]['result']): string {
  const seconds = (result.durationMs / 1000).toFixed(1)
  const playerHp = Math.round(result.playerHp * 10) / 10
  const monsterHp = Math.round(result.monsterHp * 10) / 10
  if (result.outcome === 'monster-defeated') return `WIN ${seconds}s / ${playerHp} HP`
  if (result.outcome === 'player-defeated') return `LOSS ${seconds}s / ${monsterHp} foe HP`
  return `TIMEOUT / ${playerHp} HP`
}

function printReport() {
  console.log(`\nDungeon normal farming — level 19, ${(FARM_DURATION_MS / 60000).toFixed(0)} simulated minutes`)
  console.table(farmResults.map(({ scenario, results }) => Object.fromEntries([
    ['Scenario', scenario.name],
    ...results.map(({ monster, result }) => [
      monster.combatant.name,
      `${result.xpPerMinute.toFixed(1)} XP/m | ${(result.averageFightDurationMs / 1000).toFixed(1)}s/fight | ${result.kills}K ${result.deaths}D`,
    ]),
  ])))

  for (const level of dragonBenchmarkLevels) {
    console.log(`\nDragon duel — player level ${level}`)
    console.table(dragonResults
      .filter(result => result.level === level)
      .map(({ scenario, result }) => ({ Scenario: scenario.name, Result: duelLabel(result) })))
  }
}

describe('Dungeon balance simulation', () => {
  it('completes every normal farming scenario with finite metrics', () => {
    expect(farmResults).toHaveLength(dungeonScenarios.length)
    for (const { results } of farmResults) {
      expect(results).toHaveLength(4)
      for (const { result } of results) {
        expect(result.durationMs).toBe(FARM_DURATION_MS)
        expect(result.kills).toBeGreaterThanOrEqual(0)
        expect(result.deaths).toBeGreaterThanOrEqual(0)
        expect(Number.isFinite(result.xpPerMinute)).toBe(true)
        expect(Number.isFinite(result.averageFightDurationMs)).toBe(true)
      }
    }
  })

  it('uses legal six-choice level-19 builds with a distinct seventh choice at level 21', () => {
    for (const { build } of dungeonScenarios) {
      expect(build.ownedSkillChoiceIds).toHaveLength(6)
      expect(build.ownedSkillChoiceIds).not.toContain(build.level21SkillChoiceId)
    }
  })

  it('uses Great weapons throughout the benchmark window', () => {
    for (const scenario of dungeonScenarios) {
      expect(dungeonPlayerDefinition(19, scenario.build, scenario.weaponSlot).weapon.name).toMatch(/^Great /)
      expect(dungeonPlayerDefinition(20, scenario.build, scenario.weaponSlot).weapon.name).toMatch(/^Great /)
      expect(dungeonPlayerDefinition(22, scenario.build, scenario.weaponSlot).weapon.name).toMatch(/^Great /)
    }
  })

  it('lets every build farm each normal with at least one weapon', () => {
    for (const build of dungeonBuilds) {
      const buildResults = farmResults.filter(result => result.scenario.build === build)
      for (let monsterIndex = 0; monsterIndex < normalMonsters.length; monsterIndex += 1) {
        expect(buildResults.some(result => result.results[monsterIndex]!.result.kills > 0)).toBe(true)
      }
    }
  })

  it('keeps Dagger reliable against Rogue while allowing Axe hard counters', () => {
    for (const build of dungeonBuilds) {
      const daggerResult = farmResults.find(
        result => result.scenario.build === build && result.scenario.weaponSlot === 'dagger',
      )!
      expect(daggerResult.results[3]!.result.kills).toBeGreaterThan(0)
    }

    expect(farmResults.some(
      result => result.scenario.weaponSlot === 'axe' && result.results[3]!.result.kills === 0,
    )).toBe(true)
  })

  it('resolves every Dragon benchmark without reaching the safety timeout', () => {
    expect(dragonResults).toHaveLength(dungeonScenarios.length * dragonBenchmarkLevels.length)
    for (const { result } of dragonResults) expect(result.outcome).not.toBe('timeout')
  })

  it('makes Dragon a passive arrival wall with broad level-20 clears', () => {
    const arrivalWins = dragonResults.filter(
      result => result.level === 19 && result.result.outcome === 'monster-defeated',
    )
    const expectedClearWins = dragonResults.filter(
      result => result.level === 20 && result.result.outcome === 'monster-defeated',
    )

    expect(arrivalWins).toHaveLength(15)
    expect(expectedClearWins).toHaveLength(22)
    expect(new Set(expectedClearWins.map(result => result.scenario.build.name)).size)
      .toBe(dungeonBuilds.length)

    const winningWeaponSlots = new Set(expectedClearWins.map(result => result.scenario.weaponSlot))
    expect(winningWeaponSlots).toEqual(new Set(['dagger', 'sword', 'axe']))
  })

  if (REPORT) printReport()
})
