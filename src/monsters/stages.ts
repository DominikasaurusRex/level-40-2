import { caveMonsters } from '@/monsters/cave-monsters'
import { forestMonsters } from '@/monsters/forest-monsters'
import type { MonsterDefinition } from '@/monsters/monster-definition'

/** Every monster in stage order: index 0 is stage 1. */
export const stageMonsters: readonly MonsterDefinition[] = [...forestMonsters, ...caveMonsters]
