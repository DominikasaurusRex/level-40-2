import { describe, expect, it } from 'vitest'
import { hellMonsters } from '@/data/monster/hell-monsters'
import { hellBuilds, hellPlayerDefinition, hellScenarios } from '@/balance/hell-scenarios'
import { simulateDuel, simulateFarm } from '@/combat/simulator'

const FARM_DURATION_MS = 5 * 60 * 1000
const REPORT = import.meta.env.VITE_BALANCE_REPORT === '1' || import.meta.env.MODE === 'balance'
const normalMonsters = hellMonsters.slice(0, 4)
const wallOfFlesh = hellMonsters[3]!
const angel = hellMonsters[4]!
const wallBenchmarkLevels = [21, 22, 24]
const angelBenchmarkLevels = [22, 23, 25]

const farmResults = hellScenarios.map(scenario => ({
  scenario,
  results: normalMonsters.map(monster => ({
    monster,
    result: simulateFarm(
      hellPlayerDefinition(22, scenario.build, scenario.weaponSlot),
      monster.combatant,
      monster.xp,
      FARM_DURATION_MS,
    ),
  })),
}))

const angelResults = angelBenchmarkLevels.flatMap(level =>
  hellScenarios.map(scenario => ({
    level,
    scenario,
    result: simulateDuel(
      hellPlayerDefinition(level, scenario.build, scenario.weaponSlot),
      angel.combatant,
    ),
  })),
)

const wallResults = wallBenchmarkLevels.flatMap(level =>
  hellScenarios.map(scenario => ({
    level,
    scenario,
    result: simulateDuel(
      hellPlayerDefinition(level, scenario.build, scenario.weaponSlot),
      wallOfFlesh.combatant,
    ),
  })),
)

function duelLabel(result: (typeof angelResults)[number]['result']): string {
  const seconds = (result.durationMs / 1000).toFixed(1)
  const playerHp = Math.round(result.playerHp * 10) / 10
  const monsterHp = Math.round(result.monsterHp * 10) / 10
  if (result.outcome === 'monster-defeated') return `WIN ${seconds}s / ${playerHp} HP`
  if (result.outcome === 'player-defeated') return `LOSS ${seconds}s / ${monsterHp} foe HP`
  return `TIMEOUT / ${playerHp} HP`
}

function printReport() {
  console.log(`\nHell normal farming — level 22, ${(FARM_DURATION_MS / 60000).toFixed(0)} simulated minutes`)
  console.table(farmResults.map(({ scenario, results }) => Object.fromEntries([
    ['Scenario', scenario.name],
    ...results.map(({ monster, result }) => [
      monster.combatant.name,
      `${result.xpPerMinute.toFixed(1)} XP/m | ${(result.averageFightDurationMs / 1000).toFixed(1)}s/fight | ${result.kills}K ${result.deaths}D`,
    ]),
  ])))

  for (const level of angelBenchmarkLevels) {
    console.log(`\nAngel duel — player level ${level}`)
    console.table(angelResults
      .filter(result => result.level === level)
      .map(({ scenario, result }) => ({ Scenario: scenario.name, Result: duelLabel(result) })))
  }

  for (const level of wallBenchmarkLevels) {
    console.log(`\nWall of Flesh duel — player level ${level}`)
    console.table(wallResults
      .filter(result => result.level === level)
      .map(({ scenario, result }) => ({ Scenario: scenario.name, Result: duelLabel(result) })))
  }
}

describe('Hell balance simulation', () => {
  it('completes every normal farming scenario with finite metrics', () => {
    expect(farmResults).toHaveLength(hellScenarios.length)
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

  it('uses legal seven-choice Hell builds', () => {
    for (const { build } of hellScenarios) {
      expect(build.ownedSkillChoiceIds).toHaveLength(7)
      expect(new Set(build.ownedSkillChoiceIds).size).toBe(7)
    }
  })

  it('lets every build farm each normal with at least one weapon', () => {
    for (const build of hellBuilds) {
      const buildResults = farmResults.filter(result => result.scenario.build === build)
      for (let monsterIndex = 0; monsterIndex < normalMonsters.length; monsterIndex += 1) {
        expect(buildResults.some(result => result.results[monsterIndex]!.result.kills > 0)).toBe(true)
      }
    }
  })

  it('keeps Dagger reliable against Watcher while allowing Axe hard counters', () => {
    for (const build of hellBuilds) {
      const daggerResult = farmResults.find(
        result => result.scenario.build === build && result.scenario.weaponSlot === 'dagger',
      )!
      expect(daggerResult.results[2]!.result.kills).toBeGreaterThan(0)
    }

    expect(farmResults.some(
      result => result.scenario.weaponSlot === 'axe' && result.results[2]!.result.kills === 0,
    )).toBe(true)
  })

  it('uses Great weapons throughout both arrival and expected-clear windows', () => {
    for (const scenario of hellScenarios) {
      expect(hellPlayerDefinition(21, scenario.build, scenario.weaponSlot).weapon.name).toMatch(/^Great /)
      expect(hellPlayerDefinition(22, scenario.build, scenario.weaponSlot).weapon.name).toMatch(/^Great /)
      expect(hellPlayerDefinition(23, scenario.build, scenario.weaponSlot).weapon.name).toMatch(/^Great /)
      expect(hellPlayerDefinition(25, scenario.build, scenario.weaponSlot).weapon.name).toMatch(/^Masterwork /)
    }
  })

  it('resolves every Angel benchmark without reaching the safety timeout', () => {
    expect(angelResults).toHaveLength(hellScenarios.length * angelBenchmarkLevels.length)
    for (const { result } of angelResults) expect(result.outcome).not.toBe('timeout')
  })

  it('schedules Angel\'s Halo, Restoration, and Judgment as one repeating combo', () => {
    const divineJudgment = angel.combatant.skills.find(skill => skill.id === 'judgment')!
    const restoration = angel.combatant.skills.find(skill => skill.id === 'divine-restoration')!
    const halo = angel.combatant.skills.find(skill => skill.id === 'sacred-halo')!

    expect(halo.initialDelay).toBe(10000)
    expect(restoration.initialDelay).toBe(12000)
    expect(divineJudgment.initialDelay).toBe(15000)
    expect(new Set([halo.cooldown, restoration.cooldown, divineJudgment.cooldown]))
      .toEqual(new Set([18000]))
    expect(halo.effects).toContainEqual({ type: 'invincible', duration: 5000 })
    expect(divineJudgment.effects).toContainEqual({ type: 'dmg', amount: 240 })
    expect(divineJudgment.effects).toContainEqual({ type: 'stun', duration: 2000 })
  })

  it('resolves every Wall of Flesh benchmark without reaching the safety timeout', () => {
    expect(wallResults).toHaveLength(hellScenarios.length * wallBenchmarkLevels.length)
    for (const { result } of wallResults) expect(result.outcome).not.toBe('timeout')
  })

  it('makes Angel the final passive wall with broad level-23 clears', () => {
    const arrivalWins = angelResults.filter(
      result => result.level === 22 && result.result.outcome === 'monster-defeated',
    )
    const expectedClearWins = angelResults.filter(
      result => result.level === 23 && result.result.outcome === 'monster-defeated',
    )

    expect(arrivalWins).toHaveLength(16)
    expect(expectedClearWins).toHaveLength(22)
    expect(new Set(expectedClearWins.map(result => result.scenario.build.name)).size)
      .toBe(hellBuilds.length)

    const winningWeaponSlots = new Set(expectedClearWins.map(result => result.scenario.weaponSlot))
    expect(winningWeaponSlots).toEqual(new Set(['dagger', 'sword', 'axe']))
  })

  it('makes Angel universally clearable in the Masterwork safety window', () => {
    expect(angelResults.filter(
      result => result.level === 25 && result.result.outcome === 'monster-defeated',
    )).toHaveLength(hellScenarios.length)
  })

  it('makes Wall of Flesh a passive level-21 wall with broad level-22 clears', () => {
    const arrivalWins = wallResults.filter(
      result => result.level === 21 && result.result.outcome === 'monster-defeated',
    )
    const expectedClearWins = wallResults.filter(
      result => result.level === 22 && result.result.outcome === 'monster-defeated',
    )

    expect(arrivalWins).toHaveLength(13)
    expect(expectedClearWins).toHaveLength(21)
    expect(new Set(expectedClearWins.map(result => result.scenario.build.name)).size)
      .toBe(hellBuilds.length)

    const winningWeaponSlots = new Set(expectedClearWins.map(result => result.scenario.weaponSlot))
    expect(winningWeaponSlots).toEqual(new Set(['dagger', 'sword', 'axe']))
  })

  if (REPORT) printReport()
})
