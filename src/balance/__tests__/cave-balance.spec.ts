import { describe, expect, it } from 'vitest'
import { caveMonsters } from '@/data/monster/cave-monsters'
import { caveBuilds, cavePlayerDefinition, caveScenarios } from '@/balance/cave-scenarios'
import { simulateDuel, simulateFarm } from '@/combat/simulator'

const FARM_DURATION_MS = 5 * 60 * 1000
const REPORT = import.meta.env.VITE_BALANCE_REPORT === '1' || import.meta.env.MODE === 'balance'
const normalMonsters = caveMonsters.slice(0, 4)
const stoneGolem = caveMonsters[4]!

const farmResults = caveScenarios.map(scenario => ({
  scenario,
  results: normalMonsters.map(monster => ({
    monster,
    result: simulateFarm(
      cavePlayerDefinition(10, scenario.build, scenario.weapon),
      monster.combatant,
      monster.xp,
      FARM_DURATION_MS,
    ),
  })),
}))

const stoneGolemResults = [10, 11].flatMap(level =>
  caveScenarios.map(scenario => ({
    level,
    scenario,
    result: simulateDuel(
      cavePlayerDefinition(level, scenario.build, scenario.weapon),
      stoneGolem.combatant,
    ),
  })),
)

function duelLabel(result: (typeof stoneGolemResults)[number]['result']): string {
  const seconds = (result.durationMs / 1000).toFixed(1)
  const playerHp = Math.round(result.playerHp * 10) / 10
  if (result.outcome === 'monster-defeated') return `WIN ${seconds}s / ${playerHp} HP`
  if (result.outcome === 'player-defeated') return `LOSS ${seconds}s`
  return `TIMEOUT / ${playerHp} HP`
}

function printReport() {
  console.log(`\nCave normal farming — level 10, ${(FARM_DURATION_MS / 60000).toFixed(0)} simulated minutes`)
  console.table(farmResults.map(({ scenario, results }) => Object.fromEntries([
    ['Scenario', scenario.name],
    ...results.map(({ monster, result }) => [
      monster.combatant.name,
      `${result.xpPerMinute.toFixed(1)} XP/m | ${(result.averageFightDurationMs / 1000).toFixed(1)}s/fight | ${result.kills}K ${result.deaths}D`,
    ]),
  ])))

  for (const level of [10, 11]) {
    console.log(`\nStone Golem duel — player level ${level}`)
    console.table(stoneGolemResults
      .filter(result => result.level === level)
      .map(({ scenario, result }) => ({ Scenario: scenario.name, Result: duelLabel(result) })))
  }
}

describe('Cave balance simulation', () => {
  it('completes every normal farming scenario with finite metrics', () => {
    expect(farmResults).toHaveLength(caveScenarios.length)
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

  it('uses only builds legal at the level-10 four-choice benchmark', () => {
    for (const { build } of caveScenarios) {
      expect(build.ownedSkillChoiceIds.length).toBeLessThanOrEqual(4)
    }
  })

  it('lets every build farm each normal with at least one weapon', () => {
    for (const build of caveBuilds) {
      const buildResults = farmResults.filter(result => result.scenario.build === build)
      for (let monsterIndex = 0; monsterIndex < normalMonsters.length; monsterIndex += 1) {
        expect(buildResults.some(result => result.results[monsterIndex]!.result.kills > 0)).toBe(true)
      }
    }
  })

  it('makes Improved Dagger the reliable counter to Cave Bat AGI', () => {
    for (const build of caveBuilds) {
      const buildResults = farmResults.filter(result => result.scenario.build === build)
      const daggerResult = buildResults.find(result => result.scenario.weapon.slot === 'dagger')!
      const otherResults = buildResults.filter(result => result.scenario.weapon.slot !== 'dagger')

      expect(daggerResult.results[0]!.result.kills).toBeGreaterThan(0)
      for (const result of otherResults) {
        expect(daggerResult.results[0]!.result.xpPerMinute)
          .toBeGreaterThan(result.results[0]!.result.xpPerMinute)
      }
    }
  })

  it('makes Stone Golem a strong arrival wall with broad level-11 clears', () => {
    expect(stoneGolemResults).toHaveLength(caveScenarios.length * 2)
    for (const { result } of stoneGolemResults) expect(result.outcome).not.toBe('timeout')

    const arrivalWins = stoneGolemResults.filter(
      result => result.level === 10 && result.result.outcome === 'monster-defeated',
    )
    const expectedClearWins = stoneGolemResults.filter(
      result => result.level === 11 && result.result.outcome === 'monster-defeated',
    )

    expect(arrivalWins).toHaveLength(10)
    expect(expectedClearWins).toHaveLength(27)
    expect(new Set(expectedClearWins.map(result => result.scenario.build.name)).size)
      .toBe(caveBuilds.length)
    expect(new Set(expectedClearWins.map(result => result.scenario.weapon.slot)))
      .toEqual(new Set(['dagger', 'sword', 'axe']))
  })

  if (REPORT) printReport()
})
