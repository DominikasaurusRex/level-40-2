import { describe, expect, it } from 'vitest'
import { wastelandMonsters } from '@/data/monster/wasteland-monsters'
import { wastelandBuilds, wastelandPlayerDefinition, wastelandScenarios } from '@/balance/wasteland-scenarios'
import { simulateDuel, simulateFarm } from '@/combat/simulator'

const FARM_DURATION_MS = 5 * 60 * 1000
const REPORT = import.meta.env.VITE_BALANCE_REPORT === '1' || import.meta.env.MODE === 'balance'
const normalMonsters = wastelandMonsters.slice(0, 4)
const wyvern = wastelandMonsters[4]!

const farmResults = wastelandScenarios.map(scenario => ({
  scenario,
  results: normalMonsters.map(monster => ({
    monster,
    result: simulateFarm(
      wastelandPlayerDefinition(13, scenario.build, scenario.weaponSlot),
      monster.combatant,
      monster.xp,
      FARM_DURATION_MS,
    ),
  })),
}))

const wyvernResults = [13, 14].flatMap(level =>
  wastelandScenarios.map(scenario => ({
    level,
    scenario,
    result: simulateDuel(
      wastelandPlayerDefinition(level, scenario.build, scenario.weaponSlot),
      wyvern.combatant,
    ),
  })),
)

function duelLabel(result: (typeof wyvernResults)[number]['result']): string {
  const seconds = (result.durationMs / 1000).toFixed(1)
  const playerHp = Math.round(result.playerHp * 10) / 10
  if (result.outcome === 'monster-defeated') return `WIN ${seconds}s / ${playerHp} HP`
  if (result.outcome === 'player-defeated') return `LOSS ${seconds}s`
  return `TIMEOUT / ${playerHp} HP`
}

function printReport() {
  console.log(`\nWasteland normal farming — level 13, ${(FARM_DURATION_MS / 60000).toFixed(0)} simulated minutes`)
  console.table(farmResults.map(({ scenario, results }) => Object.fromEntries([
    ['Scenario', scenario.name],
    ...results.map(({ monster, result }) => [
      monster.combatant.name,
      `${result.xpPerMinute.toFixed(1)} XP/m | ${(result.averageFightDurationMs / 1000).toFixed(1)}s/fight | ${result.kills}K ${result.deaths}D`,
    ]),
  ])))

  for (const level of [13, 14]) {
    console.log(`\nWyvern duel — player level ${level}`)
    console.table(wyvernResults
      .filter(result => result.level === level)
      .map(({ scenario, result }) => ({ Scenario: scenario.name, Result: duelLabel(result) })))
  }
}

describe('Wasteland balance simulation', () => {
  it('completes every normal farming scenario with finite metrics', () => {
    expect(farmResults).toHaveLength(wastelandScenarios.length)
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

  it('uses only builds legal at the level-13 five-choice benchmark', () => {
    for (const { build } of wastelandScenarios) {
      expect(build.ownedSkillChoiceIds.length).toBeLessThanOrEqual(5)
    }
  })

  it('uses Good weapons at levels 13 and 14', () => {
    for (const scenario of wastelandScenarios) {
      expect(wastelandPlayerDefinition(13, scenario.build, scenario.weaponSlot).weapon.name).toMatch(/^Good /)
      expect(wastelandPlayerDefinition(14, scenario.build, scenario.weaponSlot).weapon.name).toMatch(/^Good /)
    }
  })

  it('lets every build farm each normal with at least one weapon', () => {
    for (const build of wastelandBuilds) {
      const buildResults = farmResults.filter(result => result.scenario.build === build)
      for (let monsterIndex = 0; monsterIndex < normalMonsters.length; monsterIndex += 1) {
        expect(buildResults.some(result => result.results[monsterIndex]!.result.kills > 0)).toBe(true)
      }
    }
  })

  it('makes Dagger the reliable counter to Frilled Lizard AGI', () => {
    for (const build of wastelandBuilds) {
      const buildResults = farmResults.filter(result => result.scenario.build === build)
      const daggerResult = buildResults.find(result => result.scenario.weaponSlot === 'dagger')!
      const otherResults = buildResults.filter(result => result.scenario.weaponSlot !== 'dagger')

      expect(daggerResult.results[0]!.result.kills).toBeGreaterThan(0)
      for (const result of otherResults) {
        expect(daggerResult.results[0]!.result.xpPerMinute)
          .toBeGreaterThan(result.results[0]!.result.xpPerMinute)
      }
    }
  })

  it('makes Wyvern a passive arrival wall with broad level-14 clears', () => {
    expect(wyvernResults).toHaveLength(wastelandScenarios.length * 2)

    const arrivalWins = wyvernResults.filter(
      result => result.level === 13 && result.result.outcome === 'monster-defeated',
    )
    const expectedClearWins = wyvernResults.filter(
      result => result.level === 14 && result.result.outcome === 'monster-defeated',
    )

    expect(arrivalWins).toHaveLength(10)
    expect(expectedClearWins).toHaveLength(13)
    expect(new Set(expectedClearWins.map(result => result.scenario.build.name)).size)
      .toBe(wastelandBuilds.length)

    const winningWeaponSlots = new Set(expectedClearWins.map(result => result.scenario.weaponSlot))
    expect(winningWeaponSlots).toEqual(new Set(['dagger', 'sword', 'axe']))

    for (const { result } of wyvernResults) {
      expect(result.outcome).not.toBe('timeout')
    }
  })

  if (REPORT) printReport()
})
