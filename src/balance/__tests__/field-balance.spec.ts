import { describe, expect, it } from 'vitest'
import { fieldMonsters } from '@/data/monster/field-monsters'
import { fieldPlayerDefinition, fieldScenarios } from '@/balance/field-scenarios'
import { simulateDuel, simulateFarm } from '@/combat/simulator'

const FARM_DURATION_MS = 5 * 60 * 1000
const REPORT = import.meta.env.VITE_BALANCE_REPORT === '1' || import.meta.env.MODE === 'balance'
const normalMonsters = fieldMonsters.slice(0, 4)
const wolf = fieldMonsters[4]!

const farmResults = fieldScenarios.map(scenario => ({
  scenario,
  results: normalMonsters.map(monster => ({
    monster,
    result: simulateFarm(
      fieldPlayerDefinition(4, scenario.build, scenario.weapon),
      monster.combatant,
      monster.xp,
      FARM_DURATION_MS,
    ),
  })),
}))

const wolfResults = [4, 5].flatMap(level =>
  fieldScenarios.map(scenario => ({
    level,
    scenario,
    result: simulateDuel(
      fieldPlayerDefinition(level, scenario.build, scenario.weapon),
      wolf.combatant,
    ),
  })),
)

function duelLabel(result: (typeof wolfResults)[number]['result']): string {
  const seconds = (result.durationMs / 1000).toFixed(1)
  const playerHp = Math.round(result.playerHp * 10) / 10
  if (result.outcome === 'monster-defeated') return `WIN ${seconds}s / ${playerHp} HP`
  if (result.outcome === 'player-defeated') return `LOSS ${seconds}s`
  return `TIMEOUT / ${playerHp} HP`
}

function printReport() {
  console.log(`\nField normal farming — level 4, ${(FARM_DURATION_MS / 60000).toFixed(0)} simulated minutes`)
  console.table(farmResults.map(({ scenario, results }) => Object.fromEntries([
    ['Scenario', scenario.name],
    ...results.map(({ monster, result }) => [
      monster.combatant.name,
      `${result.xpPerMinute.toFixed(1)} XP/m | ${(result.averageFightDurationMs / 1000).toFixed(1)}s/fight | ${result.kills}K ${result.deaths}D`,
    ]),
  ])))

  for (const level of [4, 5]) {
    console.log(`\nWolf duel — player level ${level}`)
    console.table(wolfResults
      .filter(result => result.level === level)
      .map(({ scenario, result }) => ({ Scenario: scenario.name, Result: duelLabel(result) })))
  }
}

describe('Field balance simulation', () => {
  it('completes every normal farming scenario with finite metrics', () => {
    expect(farmResults).toHaveLength(fieldScenarios.length)
    for (const { results } of farmResults) {
      expect(results).toHaveLength(4)
      for (const { result } of results) {
        expect(result.kills).toBeGreaterThan(0)
        expect(Number.isFinite(result.xpPerMinute)).toBe(true)
        expect(result.averageFightDurationMs).toBeGreaterThan(0)
      }
    }
  })

  it('resolves every Wolf benchmark without reaching the safety timeout', () => {
    expect(wolfResults).toHaveLength(fieldScenarios.length * 2)
    for (const { result } of wolfResults) expect(result.outcome).not.toBe('timeout')
  })

  if (REPORT) printReport()
})
