import { describe, expect, it } from 'vitest'
import type { CombatantDefinition } from '@/types/combatant'
import type { Monster } from '@/types/monster'
import type { WeaponSlot } from '@/types/weapon'
import { fieldBuilds, fieldPlayerDefinition } from '@/balance/field-scenarios'
import { forestBuilds, forestPlayerDefinition } from '@/balance/forest-scenarios'
import { caveBuilds, cavePlayerDefinition } from '@/balance/cave-scenarios'
import { wastelandBuilds, wastelandPlayerDefinition } from '@/balance/wasteland-scenarios'
import { ruinsBuilds, ruinsPlayerDefinition } from '@/balance/ruins-scenarios'
import { dungeonBuilds, dungeonPlayerDefinition } from '@/balance/dungeon-scenarios'
import { hellBuilds, hellPlayerDefinition } from '@/balance/hell-scenarios'
import { abyssBuilds, abyssPlayerDefinition } from '@/balance/abyss-scenarios'
import { fieldMonsters } from '@/data/monster/field-monsters'
import { forestMonsters } from '@/data/monster/forest-monsters'
import { caveMonsters } from '@/data/monster/cave-monsters'
import { wastelandMonsters } from '@/data/monster/wasteland-monsters'
import { ruinsMonsters } from '@/data/monster/ruins-monsters'
import { dungeonMonsters } from '@/data/monster/dungeon-monsters'
import { hellMonsters } from '@/data/monster/hell-monsters'
import { abyssMonsters } from '@/data/monster/abyss-monsters'
import { weapons } from '@/data/weapons'
import { simulateDuel } from '@/combat/simulator'

function defineLevelAwareProgressionContract<Build extends { name: string }>(
  areaName: string,
  builds: Build[],
  monsters: Monster[],
  normalBenchmarkLevel: number,
  bossTargetLevel: number,
  playerDefinition: (level: number, build: Build, weaponSlot: WeaponSlot) => CombatantDefinition,
) {
  describe(`${areaName} mandatory progression`, () => {
    for (const build of builds) {
      it(`${build.name} can clear every enemy with some weapon within the safety window`, () => {
        const failures = monsters.flatMap((monster, index) => {
          const firstLevel = index === monsters.length - 1 ? bossTargetLevel : normalBenchmarkLevel
          const lastLevel = firstLevel + 2

          for (let level = firstLevel; level <= lastLevel; level += 1) {
            for (const weapon of weapons) {
              const result = simulateDuel(
                playerDefinition(level, build, weapon.slot!),
                monster.combatant,
              )
              if (result.outcome === 'monster-defeated') return []
            }
          }

          return [`${monster.combatant.name} (levels ${firstLevel}–${lastLevel})`]
        })

        expect(failures, `${build.name} has mandatory enemies it cannot clear`).toEqual([])
      })
    }
  })
}

const weaponForSlot = (slot: WeaponSlot) => weapons.find(weapon => weapon.slot === slot)!

defineLevelAwareProgressionContract('Field', fieldBuilds, fieldMonsters, 4, 5,
  (level, build, slot) => fieldPlayerDefinition(level, build, weaponForSlot(slot)))
defineLevelAwareProgressionContract('Forest', forestBuilds, forestMonsters, 7, 8,
  (level, build, slot) => forestPlayerDefinition(level, build, weaponForSlot(slot)))
defineLevelAwareProgressionContract('Cave', caveBuilds, caveMonsters, 10, 11,
  (level, build, slot) => cavePlayerDefinition(level, build, weaponForSlot(slot)))
defineLevelAwareProgressionContract('Wasteland', wastelandBuilds, wastelandMonsters, 13, 14, wastelandPlayerDefinition)
defineLevelAwareProgressionContract('Ruins', ruinsBuilds, ruinsMonsters, 16, 17, ruinsPlayerDefinition)
defineLevelAwareProgressionContract('Dungeon', dungeonBuilds, dungeonMonsters, 19, 20, dungeonPlayerDefinition)
defineLevelAwareProgressionContract('Hell', hellBuilds, hellMonsters, 22, 23, hellPlayerDefinition)
defineLevelAwareProgressionContract('Abyss', abyssBuilds, abyssMonsters, 25, 26, abyssPlayerDefinition)
