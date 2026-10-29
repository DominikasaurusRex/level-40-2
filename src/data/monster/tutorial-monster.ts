import type { Monster } from '@/types/monster'

/**
 * Level 0 exists only while a new player is in the tutorial. It deliberately
 * awards no XP and cannot hurt the player, so repeating or pausing the
 * tutorial can never change normal progression.
 */
export const trainingDummy: Monster = {
  image: '/enemies/tutorial/dummy.png',
  spriteScale: 0.72,
  spriteGroundOffset: 16,
  xp: 0,
  combatant: {
    name: 'Training Dummy',
    maxHp: 20,
    weapon: {
      name: 'Basic Attack',
      damage: 0,
      cooldown: Number.MAX_SAFE_INTEGER,
    },
    skills: [],
  },
}
