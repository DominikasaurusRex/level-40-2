import type { Monster } from '@/types/monster.ts'

export const fieldMonsters: Monster[] = [
  {
    image: '/enemies/field/slime.webp',
    spriteScale: 0.4,
    xpOrbRadius: 80,
    xpOrbOffset: 20,
    xp: 18,
    combatant: {
      name: 'Slime',
      maxHp: 21,
      weapon: { name: 'Basic Attack', damage: 2, cooldown: 3000 },
      skills: [],
    },
  },
  {
    image: '/enemies/field/giant-rat.webp',
    spriteScale: 0.45,
    xpOrbRadius: 80,
    xpOrbOffset: 30,
    xp: 19,
    combatant: {
      name: 'Giant Rat',
      maxHp: 22,
      weapon: { name: 'Basic Attack', damage: 1, cooldown: 1500 },
      skills: [
        { id: 'bite', name: 'Bite', category: 'attack', cooldown: 7000, effects: [{ type: 'dmg', amount: 3 }] },
      ],
    },
  },
  {
    image: '/enemies/field/wild-boar.webp',
    spriteScale: 0.65,
    xpOrbRadius: 120,
    xpOrbOffset: 60,
    xp: 20,
    combatant: {
      name: 'Wild Boar',
      maxHp: 24,
      weapon: { name: 'Basic Attack', damage: 4, cooldown: 4000 },
      skills: [
        { id: 'charge', name: 'Charge', category: 'attack', cooldown: 10000, effects: [{ type: 'dmg', amount: 7 }] },
      ],
    },
  },
  {
    image: '/enemies/field/goblin.webp',
    spriteScale: 0.65,
    spriteGroundOffset: 25,
    xpOrbRadius: 60,
    xpOrbOffset: 100,
    xp: 21,
    combatant: {
      name: 'Goblin',
      maxHp: 17,
      weapon: { name: 'Basic Attack', damage: 3, cooldown: 3000 },
      skills: [
        {
          id: 'block',
          name: 'Block',
          category: 'guard',
          cooldown: 12000,
          startsReady: true,
          effects: [{ type: 'def', amount: 4 }],
        },
      ],
    },
  },
  {
    image: '/enemies/field/wolf.webp',
    spriteScale: 0.65,
    xpOrbRadius: 60,
    xpOrbOffset: 100,
    xp: 25,
    combatant: {
      name: 'Wolf',
      maxHp: 42,
      weapon: { name: 'Basic Attack', damage: 3, cooldown: 2000 },
      skills: [
        {
          id: 'rend',
          name: 'Rend',
          category: 'attack',
          cooldown: 9000,
          effects: [{ type: 'bleed', amountPerTick: 2, tickInterval: 1000, duration: 4000 }],
        },
      ],
    },
  },
]
