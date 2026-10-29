import type { Player } from '@/types/player'
import { sword, weapons } from '@/data/weapons'

export const startingPlayer: Player = {
  level: 1,
  xp: 0,
  power: 1,
  ownedSkillChoiceIds: [],
  weapons: [...weapons],
  equippedWeaponSlot: 'sword',
  combatant: {
    name: 'Player',
    maxHp: 20,
    weapon: sword,
    skills: [],
  },
}
