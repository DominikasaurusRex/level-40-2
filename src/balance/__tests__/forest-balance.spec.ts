import { describe, expect, it } from 'vitest'
import { forestMonsters } from '@/data/monster/forest-monsters'
import { forestBuilds, forestPlayerDefinition, forestScenarios } from '@/balance/forest-scenarios'
import { simulateDuel, simulateFarm } from '@/combat/simulator'

const FARM_DURATION_MS = 5 * 60 * 1000
const REPORT = import.meta.env.VITE_BALANCE_REPORT === '1' || import.meta.env.MODE === 'balance'
const normalMonsters = forestMonsters.slice(0, 4)
const thornDryad = forestMonsters[4]!

const farmResults = forestScenarios.map(scenario => ({
  scenario,
  results: normalMonsters.map(monster => ({
    monster,
    result: simulateFarm(
      forestPlayerDefinition(7, scenario.build, scenario.weapon),
      monster.combatant,
      monster.xp,
      FARM_DURATION_MS,
    ),
  })),
}))

const thornDryadResults = [7, 8].flatMap(level =>
  forestScenarios.map(scenario => ({
    level,
    scenario,
    result: simulateDuel(
      forestPlayerDefinition(level, scenario.build, scenario.weapon),
      thornDryad.combatant,
    ),
  })),
)

function duelLabel(result: (typeof thornDryadResults)[number]['result']): string {
  const seconds = (result.durationMs / 1000).toFixed(1)
  const playerHp = Math.round(result.playerHp * 10) / 10
  if (result.outcome === 'monster-defeated') return `WIN ${seconds}s / ${playerHp} HP`
  if (result.outcome === 'player-defeated') return `LOSS ${seconds}s`
  return `TIMEOUT / ${playerHp} HP`
}

function printReport() {
  console.log(`\nForest normal farming — level 7, ${(FARM_DURATION_MS / 60000).toFixed(0)} simulated minutes`)
  console.table(farmResults.map(({ scenario, results }) => Object.fromEntries([
    ['Scenario', scenario.name],
    ...results.map(({ monster, result }) => [
      monster.combatant.name,
      `${result.xpPerMinute.toFixed(1)} XP/m | ${(result.averageFightDurationMs / 1000).toFixed(1)}s/fight | ${result.kills}K ${result.deaths}D`,
    ]),
  ])))

  for (const level of [7, 8]) {
    console.log(`\nThorn Dryad duel — player level ${level}`)
    console.table(thornDryadResults
      .filter(result => result.level === level)
      .map(({ scenario, result }) => ({ Scenario: scenario.name, Result: duelLabel(result) })))
  }
}

describe('Forest balance simulation', () => {
  it('completes every normal farming scenario with finite metrics', () => {
    expect(farmResults).toHaveLength(forestScenarios.length)
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

  it('uses only builds legal at the level-7 three-choice benchmark', () => {
    for (const { build } of forestScenarios) {
      expect(build.ownedSkillChoiceIds.length).toBeLessThanOrEqual(3)
    }
  })

  it('makes Thorn Dryad a passive arrival wall and broadly clearable at level 8', () => {
    expect(thornDryadResults).toHaveLength(forestScenarios.length * 2)

    const arrivalWins = thornDryadResults.filter(
      result => result.level === 7 && result.result.outcome === 'monster-defeated',
    )
    const expectedClearWins = thornDryadResults.filter(
      result => result.level === 8 && result.result.outcome === 'monster-defeated',
    )

    expect(arrivalWins).toHaveLength(9)
    expect(expectedClearWins).toHaveLength(15)

    for (const build of forestBuilds) {
      const buildWinsAtExpectedClear = expectedClearWins.filter(result => result.scenario.build === build)
      expect(buildWinsAtExpectedClear.length).toBeGreaterThan(0)
    }

    const winningWeaponSlots = new Set(expectedClearWins.map(result => result.scenario.weapon.slot))
    expect(winningWeaponSlots).toEqual(new Set(['dagger', 'sword', 'axe']))
  })

  if (REPORT) printReport()
})
