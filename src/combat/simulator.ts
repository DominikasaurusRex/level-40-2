import type { CombatantDefinition } from '@/types/combatant'
import { createCombatantState } from '@/types/combatant'
import { advanceFight, type FightOutcome } from '@/combat/engine'

export interface SimulationOptions {
  tickMs?: number
  maxDurationMs?: number
}

export interface DuelResult {
  outcome: FightOutcome | 'timeout'
  durationMs: number
  playerHp: number
  minimumPlayerHp: number
  monsterHp: number
}

export interface FarmResult {
  durationMs: number
  kills: number
  deaths: number
  averageFightDurationMs: number
  xp: number
  xpPerMinute: number
  minimumPlayerHp: number
  finalPlayerHp: number
}

const DEFAULT_TICK_MS = 100
const DEFAULT_DUEL_LIMIT_MS = 5 * 60 * 1000

export function simulateDuel(
  playerDefinition: CombatantDefinition,
  monsterDefinition: CombatantDefinition,
  options: SimulationOptions = {},
): DuelResult {
  const tickMs = options.tickMs ?? DEFAULT_TICK_MS
  const maxDurationMs = options.maxDurationMs ?? DEFAULT_DUEL_LIMIT_MS
  const player = createCombatantState(playerDefinition)
  const monster = createCombatantState(monsterDefinition)
  let minimumPlayerHp = player.hp

  for (let elapsed = tickMs; elapsed <= maxDurationMs; elapsed += tickMs) {
    const outcome = advanceFight(player, monster, tickMs)
    minimumPlayerHp = Math.min(minimumPlayerHp, player.hp)
    if (outcome !== 'ongoing') {
      return {
        outcome,
        durationMs: elapsed,
        playerHp: player.hp,
        minimumPlayerHp,
        monsterHp: monster.hp,
      }
    }
  }

  return {
    outcome: 'timeout',
    durationMs: maxDurationMs,
    playerHp: player.hp,
    minimumPlayerHp,
    monsterHp: monster.hp,
  }
}

/**
 * Fast-forwards repeated fights against one monster. Monster kills preserve
 * the player's live state; player deaths reset both sides, matching the store.
 */
export function simulateFarm(
  playerDefinition: CombatantDefinition,
  monsterDefinition: CombatantDefinition,
  monsterXp: number,
  durationMs: number,
  options: Pick<SimulationOptions, 'tickMs'> = {},
): FarmResult {
  const tickMs = options.tickMs ?? DEFAULT_TICK_MS
  let player = createCombatantState(playerDefinition)
  let monster = createCombatantState(monsterDefinition)
  let kills = 0
  let deaths = 0
  let currentFightDurationMs = 0
  let completedFightDurationMs = 0
  let minimumPlayerHp = player.hp

  for (let elapsed = tickMs; elapsed <= durationMs; elapsed += tickMs) {
    currentFightDurationMs += tickMs
    const outcome = advanceFight(player, monster, tickMs)
    minimumPlayerHp = Math.min(minimumPlayerHp, player.hp)

    if (outcome === 'monster-defeated') {
      kills += 1
      completedFightDurationMs += currentFightDurationMs
      currentFightDurationMs = 0
      monster = createCombatantState(monsterDefinition)
    } else if (outcome === 'player-defeated') {
      deaths += 1
      currentFightDurationMs = 0
      player = createCombatantState(playerDefinition)
      monster = createCombatantState(monsterDefinition)
    }
  }

  const xp = kills * monsterXp
  return {
    durationMs,
    kills,
    deaths,
    averageFightDurationMs: kills > 0 ? completedFightDurationMs / kills : 0,
    xp,
    xpPerMinute: durationMs > 0 ? xp / (durationMs / 60000) : 0,
    minimumPlayerHp,
    finalPlayerHp: player.hp,
  }
}
