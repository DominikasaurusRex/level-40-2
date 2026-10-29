import { powerForPlayerLevel } from '@/data/player-power-curve'

const BADGE_POWER_BONUS = 2

export function balancePlayerPower(level: number, earnedBadgeCount: number): number {
  const levelPower = powerForPlayerLevel.get(level)
  if (levelPower === undefined) throw new Error(`No player Power data for level ${level}`)

  return levelPower + earnedBadgeCount * BADGE_POWER_BONUS
}
