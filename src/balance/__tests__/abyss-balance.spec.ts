import { describe, expect, it } from 'vitest'
import { abyssMonsters } from '@/data/monster/abyss-monsters'
import { abyssBuilds, abyssPlayerDefinition, abyssScenarios } from '@/balance/abyss-scenarios'
import { simulateDuel, simulateFarm } from '@/combat/simulator'

const FARM_DURATION_MS = 5 * 60 * 1000
const REPORT = import.meta.env.VITE_BALANCE_REPORT === '1' || import.meta.env.MODE === 'balance'
const tentacle = abyssMonsters[1]!

const encounterBenchmarks = [
  { monster: abyssMonsters[0]!, levels: [23, 24] },
  { monster: tentacle, levels: [24, 25] },
  { monster: abyssMonsters[2]!, levels: [25, 26] },
  { monster: abyssMonsters[3]!, levels: [26, 27] },
  { monster: abyssMonsters[4]!, levels: [27, 28] },
]

const duelResults = encounterBenchmarks.flatMap(benchmark =>
  benchmark.levels.flatMap(level =>
    abyssScenarios.map(scenario => ({
      monster: benchmark.monster,
      level,
      scenario,
      result: simulateDuel(
        abyssPlayerDefinition(level, scenario.build, scenario.weaponSlot),
        benchmark.monster.combatant,
      ),
    })),
  ),
)

const tentacleFarmResults = abyssScenarios.map(scenario => ({
  scenario,
  result: simulateFarm(
    abyssPlayerDefinition(24, scenario.build, scenario.weaponSlot),
    tentacle.combatant,
    tentacle.xp,
    FARM_DURATION_MS,
  ),
}))

function winsFor(monster: (typeof abyssMonsters)[number], level: number) {
  return duelResults.filter(result =>
    result.monster === monster
    && result.level === level
    && result.result.outcome === 'monster-defeated')
}

function duelLabel(result: (typeof duelResults)[number]['result']): string {
  const seconds = (result.durationMs / 1000).toFixed(1)
  const minimumPlayerHp = Math.round(result.minimumPlayerHp * 10) / 10
  const monsterHp = Math.round(result.monsterHp * 10) / 10
  if (result.outcome === 'monster-defeated') return `WIN ${seconds}s / ${minimumPlayerHp} min HP`
  if (result.outcome === 'player-defeated') return `LOSS ${seconds}s / ${monsterHp} foe HP`
  return `TIMEOUT / ${minimumPlayerHp} min HP`
}

function printReport() {
  console.log('\nAbyss gauntlet summary')
  console.table(encounterBenchmarks.flatMap(({ monster, levels }) => levels.map(level => {
    const results = duelResults.filter(result => result.monster === monster && result.level === level)
    const wins = results.filter(result => result.result.outcome === 'monster-defeated')
    const averageMinimumHp = wins.reduce((sum, result) => sum + result.result.minimumPlayerHp, 0) / wins.length
    const maxHp = abyssPlayerDefinition(level, abyssScenarios[0]!.build, 'sword').maxHp
    const averageClearMs = wins.reduce((sum, result) => sum + result.result.durationMs, 0) / wins.length
    return {
      Encounter: monster.combatant.name,
      Level: level,
      Wins: `${wins.length}/${results.length}`,
      Builds: new Set(wins.map(result => result.scenario.build.name)).size,
      'Missing builds': abyssBuilds
        .filter(build => !wins.some(result => result.scenario.build.name === build.name))
        .map(build => build.name)
        .join(', ') || '—',
      Weapons: new Set(wins.map(result => result.scenario.weaponSlot)).size,
      'Avg min HP': `${(averageMinimumHp / maxHp * 100).toFixed(1)}%`,
      'Avg clear': `${(averageClearMs / 1000).toFixed(1)}s`,
    }
  })))

  console.log(`\nTentacle farming — level 24, ${(FARM_DURATION_MS / 60000).toFixed(0)} simulated minutes`)
  console.table(tentacleFarmResults.map(({ scenario, result }) => ({
    Scenario: scenario.name,
    Result: `${result.xpPerMinute.toFixed(1)} XP/m | ${(result.averageFightDurationMs / 1000).toFixed(1)}s/fight | ${result.kills}K ${result.deaths}D | ${Math.round(result.minimumPlayerHp * 10) / 10} min HP`,
  })))

  for (const { monster, levels } of encounterBenchmarks) {
    for (const level of levels) {
      console.log(`\n${monster.combatant.name} duel — player level ${level}`)
      console.table(duelResults
        .filter(result => result.monster === monster && result.level === level)
        .map(({ scenario, result }) => ({ Scenario: scenario.name, Result: duelLabel(result) })))
    }
  }
}

describe('Abyss balance simulation', () => {
  it('runs farming only against Tentacle with finite metrics', () => {
    expect(tentacleFarmResults).toHaveLength(abyssScenarios.length)
    for (const { result } of tentacleFarmResults) {
      expect(result.durationMs).toBe(FARM_DURATION_MS)
      expect(result.kills).toBeGreaterThanOrEqual(0)
      expect(result.deaths).toBeGreaterThanOrEqual(0)
      expect(Number.isFinite(result.xpPerMinute)).toBe(true)
      expect(Number.isFinite(result.averageFightDurationMs)).toBe(true)
    }
  })

  it('uses legal level-aware choice counts', () => {
    for (const scenario of abyssScenarios) {
      expect(scenario.build.ownedSkillChoiceIds).toHaveLength(7)
      expect(new Set([
        ...scenario.build.ownedSkillChoiceIds,
        scenario.build.level25SkillChoiceId,
        scenario.build.level27SkillChoiceId,
      ]).size).toBe(9)
      expect(abyssPlayerDefinition(24, scenario.build, scenario.weaponSlot).skills.length).toBeGreaterThan(0)
      expect(abyssPlayerDefinition(25, scenario.build, scenario.weaponSlot).skills.length).toBeGreaterThan(0)
      expect(abyssPlayerDefinition(27, scenario.build, scenario.weaponSlot).skills.length).toBeGreaterThan(0)
    }
  })

  it('lets every build farm Tentacle with at least one weapon', () => {
    for (const build of abyssBuilds) {
      expect(tentacleFarmResults.some(
        entry => entry.scenario.build === build && entry.result.kills > 0,
      )).toBe(true)
    }
  })

  it('uses the weapon tiers available at each gauntlet benchmark', () => {
    for (const scenario of abyssScenarios) {
      expect(abyssPlayerDefinition(23, scenario.build, scenario.weaponSlot).weapon.name).toMatch(/^Great /)
      expect(abyssPlayerDefinition(24, scenario.build, scenario.weaponSlot).weapon.name).toMatch(/^Masterwork /)
      expect(abyssPlayerDefinition(27, scenario.build, scenario.weaponSlot).weapon.name).toMatch(/^Masterwork /)
      expect(abyssPlayerDefinition(28, scenario.build, scenario.weaponSlot).weapon.name).toMatch(/^Legendary /)
    }
  })

  it('resolves every gauntlet benchmark without reaching the safety timeout', () => {
    expect(duelResults).toHaveLength(abyssScenarios.length * encounterBenchmarks.length * 2)
    for (const { result } of duelResults) expect(result.outcome).not.toBe('timeout')
  })

  it('keeps Last Guardian dangerous but broadly beatable immediately after Angel', () => {
    const wins = winsFor(abyssMonsters[0]!, 23)

    expect(wins).toHaveLength(27)
    expect(new Set(wins.map(result => result.scenario.weaponSlot)))
      .toEqual(new Set(['dagger', 'sword', 'axe']))

    const nextLevelWins = winsFor(abyssMonsters[0]!, 24)
    expect(nextLevelWins).toHaveLength(abyssScenarios.length)
    expect(new Set(nextLevelWins.map(result => result.scenario.build.name)).size)
      .toBe(abyssBuilds.length)
  })

  it('keeps Tentacle easier than Last Guardian without making it harmless', () => {
    const wins = winsFor(tentacle, 24)
    const averageMinimumHp = wins.reduce((sum, result) => sum + result.result.minimumPlayerHp, 0) / wins.length

    expect(wins).toHaveLength(abyssScenarios.length)
    expect(averageMinimumHp)
      .toBeLessThan(abyssPlayerDefinition(24, abyssScenarios[0]!.build, 'sword').maxHp * 0.8)
  })

  it('makes Maw, Eye, and God progressively harder at their shared benchmark levels', () => {
    expect(winsFor(abyssMonsters[2]!, 26)).toHaveLength(28)
    expect(winsFor(abyssMonsters[3]!, 26)).toHaveLength(25)
    expect(winsFor(abyssMonsters[3]!, 27)).toHaveLength(29)
    expect(winsFor(abyssMonsters[4]!, 27)).toHaveLength(27)
  })

  it('keeps complete build and weapon coverage at each expected-clear level', () => {
    for (const [monster, level] of [
      [abyssMonsters[2]!, 26],
      [abyssMonsters[3]!, 27],
      [abyssMonsters[4]!, 28],
    ] as const) {
      const wins = winsFor(monster, level)
      expect(new Set(wins.map(result => result.scenario.build.name)).size).toBe(abyssBuilds.length)
      expect(new Set(wins.map(result => result.scenario.weaponSlot)))
        .toEqual(new Set(['dagger', 'sword', 'axe']))
    }
  })

  it('carries every revealed creature effect into Abyssal God', () => {
    const mawSkills = abyssMonsters[2]!.combatant.skills
    const eyeSkills = abyssMonsters[3]!.combatant.skills
    const godSkills = abyssMonsters[4]!.combatant.skills

    expect(eyeSkills.slice(0, 3).map(skill => skill.effects))
      .toEqual(mawSkills.map(skill => skill.effects))
    expect(godSkills.map(skill => skill.effects))
      .toEqual(eyeSkills.map(skill => skill.effects))
  })

  if (REPORT) printReport()
})
