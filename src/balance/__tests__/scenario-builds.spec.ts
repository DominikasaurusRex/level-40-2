import { describe, expect, it } from 'vitest'
import { isSkillChoiceAvailable } from '@/data/skill-progression'
import { fieldBuilds } from '@/balance/field-scenarios'
import { forestBuilds } from '@/balance/forest-scenarios'
import { caveBuilds } from '@/balance/cave-scenarios'
import { wastelandBuilds } from '@/balance/wasteland-scenarios'
import { ruinsBuilds } from '@/balance/ruins-scenarios'
import { dungeonBuilds } from '@/balance/dungeon-scenarios'
import { hellBuilds } from '@/balance/hell-scenarios'
import { abyssBuilds } from '@/balance/abyss-scenarios'

function expectLegalPath(name: string, choiceIds: string[], expectedChoices: number) {
  expect(choiceIds, `${name} should use every available choice`).toHaveLength(expectedChoices)

  const ownedIds: string[] = []
  for (const choiceId of choiceIds) {
    expect(
      isSkillChoiceAvailable(choiceId, ownedIds),
      `${name}: ${choiceId} is unavailable after [${ownedIds.join(', ')}]`,
    ).toBe(true)
    ownedIds.push(choiceId)
  }
}

describe('balance scenario skill-tree paths', () => {
  it('uses legal complete paths at the Field through Wasteland benchmarks', () => {
    for (const build of fieldBuilds) {
      expectLegalPath(`Field level 4 / ${build.name}`, build.ownedSkillChoiceIds, 2)
      expectLegalPath(`Field level 5 / ${build.name}`, [...build.ownedSkillChoiceIds, build.level5SkillChoiceId], 3)
    }
    for (const build of forestBuilds) {
      expectLegalPath(`Forest level 7 / ${build.name}`, build.ownedSkillChoiceIds, 3)
      expectLegalPath(`Forest level 8 / ${build.name}`, [...build.ownedSkillChoiceIds, build.level8SkillChoiceId], 4)
    }
    for (const build of caveBuilds) {
      expectLegalPath(`Cave level 10 / ${build.name}`, build.ownedSkillChoiceIds, 4)
      expectLegalPath(`Cave level 11 / ${build.name}`, [...build.ownedSkillChoiceIds, build.level11SkillChoiceId], 5)
    }
    for (const build of wastelandBuilds) expectLegalPath(`Wasteland / ${build.name}`, build.ownedSkillChoiceIds, 5)
  })

  it('uses legal level-aware paths at the Ruins through Abyss benchmarks', () => {
    for (const build of ruinsBuilds) {
      expectLegalPath(`Ruins level 15 / ${build.name}`, build.ownedSkillChoiceIds, 5)
      expectLegalPath(`Ruins level 16 / ${build.name}`, [
        ...build.ownedSkillChoiceIds,
        build.level16SkillChoiceId,
      ], 6)
    }

    for (const build of dungeonBuilds) {
      expectLegalPath(`Dungeon level 18 / ${build.name}`, build.ownedSkillChoiceIds, 6)
      expectLegalPath(`Dungeon level 21 / ${build.name}`, [
        ...build.ownedSkillChoiceIds,
        build.level21SkillChoiceId,
      ], 7)
    }

    for (const build of hellBuilds) expectLegalPath(`Hell / ${build.name}`, build.ownedSkillChoiceIds, 7)

    for (const build of abyssBuilds) {
      expectLegalPath(`Abyss level 24 / ${build.name}`, build.ownedSkillChoiceIds, 7)
      expectLegalPath(`Abyss level 25 / ${build.name}`, [
        ...build.ownedSkillChoiceIds,
        build.level25SkillChoiceId,
      ], 8)
      expectLegalPath(`Abyss level 27 / ${build.name}`, [
        ...build.ownedSkillChoiceIds,
        build.level25SkillChoiceId,
        build.level27SkillChoiceId,
      ], 9)
    }
  })
})
