import { describe, expect, it } from 'vitest'
import { ruinsMonsters } from '@/data/monster/ruins-monsters'
import { ruinsBuilds, ruinsPlayerDefinition, ruinsScenarios } from '@/balance/ruins-scenarios'
import { simulateDuel, simulateFarm } from '@/combat/simulator'

const FARM_DURATION_MS = 5 * 60 * 1000
const REPORT = import.meta.env.VITE_BALANCE_REPORT === '1' || import.meta.env.MODE === 'balance'
const normalMonsters = ruinsMonsters.slice(0, 4)
const ruinedColossus = ruinsMonsters[4]!
const colossusBenchmarkLevels = [16, 17, 19]

const farmResults = ruinsScenarios.map(scenario => ({
  scenario,
  results: normalMonsters.map(monster => ({
    monster,
    result: simulateFarm(
      ruinsPlayerDefinition(16, scenario.build, scenario.weaponSlot),
      monster.combatant,
      monster.xp,
      FARM_DURATION_MS,
    ),
  })),
}))

const colossusResults = colossusBenchmarkLevels.flatMap(level =>
  ruinsScenarios.map(scenario => ({
    level,
    scenario,
    result: simulateDuel(
      ruinsPlayerDefinition(level, scenario.build, scenario.weaponSlot),
      ruinedColossus.combatant,
    ),
  })),
)

function duelLabel(result: (typeof colossusResults)[number]['result']): string {
  const seconds = (result.durationMs / 1000).toFixed(1)
  const playerHp = Math.round(result.playerHp * 10) / 10
  const monsterHp = Math.round(result.monsterHp * 10) / 10
  if (result.outcome === 'monster-defeated') return `WIN ${seconds}s / ${playerHp} HP`
  if (result.outcome === 'player-defeated') return `LOSS ${seconds}s / ${monsterHp} foe HP`
  return `TIMEOUT / ${playerHp} HP`
}

function printReport() {
  console.log(`\nRuins normal farming — level 16, ${(FARM_DURATION_MS / 60000).toFixed(0)} simulated minutes`)
  console.table(farmResults.map(({ scenario, results }) => Object.fromEntries([
    ['Scenario', scenario.name],
    ...results.map(({ monster, result }) => [
      monster.combatant.name,
      `${result.xpPerMinute.toFixed(1)} XP/m | ${(result.averageFightDurationMs / 1000).toFixed(1)}s/fight | ${result.kills}K ${result.deaths}D`,
    ]),
  ])))

  for (const level of colossusBenchmarkLevels) {
    console.log(`\nRuined Colossus duel — player level ${level}`)
    console.table(colossusResults
      .filter(result => result.level === level)
      .map(({ scenario, result }) => ({ Scenario: scenario.name, Result: duelLabel(result) })))
  }
}

describe('Ruins balance simulation', () => {
  it('completes every normal farming scenario with finite metrics', () => {
    expect(farmResults).toHaveLength(ruinsScenarios.length)
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

  it('uses legal five-choice paths with a sixth choice at the level-16 benchmark', () => {
    for (const { build } of ruinsScenarios) {
      expect(build.ownedSkillChoiceIds).toHaveLength(5)
      expect(build.ownedSkillChoiceIds).not.toContain(build.level16SkillChoiceId)
    }
  })

  it('uses Good weapons at levels 16 and 17 and Great weapons at level 19', () => {
    for (const scenario of ruinsScenarios) {
      expect(ruinsPlayerDefinition(16, scenario.build, scenario.weaponSlot).weapon.name).toMatch(/^Good /)
      expect(ruinsPlayerDefinition(17, scenario.build, scenario.weaponSlot).weapon.name).toMatch(/^Good /)
      expect(ruinsPlayerDefinition(19, scenario.build, scenario.weaponSlot).weapon.name).toMatch(/^Great /)
    }
  })

  it('lets every build farm each normal with at least one weapon', () => {
    for (const build of ruinsBuilds) {
      const buildResults = farmResults.filter(result => result.scenario.build === build)
      for (let monsterIndex = 0; monsterIndex < normalMonsters.length; monsterIndex += 1) {
        expect(buildResults.some(result => result.results[monsterIndex]!.result.kills > 0)).toBe(true)
      }
    }
  })

  it('makes Dagger the reliable counter to Gargoyle AGI', () => {
    for (const build of ruinsBuilds) {
      const buildResults = farmResults.filter(result => result.scenario.build === build)
      const daggerResult = buildResults.find(result => result.scenario.weaponSlot === 'dagger')!
      const otherResults = buildResults.filter(result => result.scenario.weaponSlot !== 'dagger')

      expect(daggerResult.results[1]!.result.kills).toBeGreaterThan(0)
      for (const result of otherResults) {
        expect(daggerResult.results[1]!.result.xpPerMinute)
          .toBeGreaterThan(result.results[1]!.result.xpPerMinute)
      }
    }
  })

  it('resolves every Ruined Colossus benchmark without reaching the safety timeout', () => {
    expect(colossusResults).toHaveLength(ruinsScenarios.length * colossusBenchmarkLevels.length)
    for (const { result } of colossusResults) expect(result.outcome).not.toBe('timeout')
  })

  it('makes Ruined Colossus a provisional passive wall with broad level-17 clears', () => {
    const arrivalWins = colossusResults.filter(
      result => result.level === 16 && result.result.outcome === 'monster-defeated',
    )
    const expectedClearWins = colossusResults.filter(
      result => result.level === 17 && result.result.outcome === 'monster-defeated',
    )

    expect(arrivalWins).toHaveLength(18)
    expect(expectedClearWins).toHaveLength(25)
    expect(new Set(expectedClearWins.map(result => result.scenario.build.name)).size)
      .toBe(ruinsBuilds.length)

    const winningWeaponSlots = new Set(expectedClearWins.map(result => result.scenario.weaponSlot))
    expect(winningWeaponSlots).toEqual(new Set(['dagger', 'sword', 'axe']))
  })

  if (REPORT) printReport()
})
