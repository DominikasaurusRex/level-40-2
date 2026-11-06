import type { Monster } from '@/types/monster.ts'

/**
 * TODO: Stages 6–10 (Cave), in stage order. Stats are still the original Level 40 values and await
 * their Level 40 2 rework (see `.documentation/enemies.md`).
 */
export const caveMonsters: Monster[] = [
  {
    image: '/enemies/cave/cave-bat.webp',
    spriteScale: 0.55,
    spriteGroundOffset: 135,
    xpOrbRadius: 50,
    xpOrbOffset: 40,
    xp: 162,
    combatant: {
      name: 'Cave Bat',
      maxHp: 91,
      weapon: { name: 'Basic Attack', damage: 2, cooldown: 1200 },
      skills: [
        {
          id: 'evasive-flight',
          name: 'Evasive Flight',
          category: 'guard',
          cooldown: 8000,
          effects: [{ type: 'agi', charges: 2 }],
        },
      ],
    },
  },
  {
    image: '/enemies/cave/stone-tortoise.webp',
    spriteScale: 0.75,
    spriteGroundOffset: 15,
    xpOrbRadius: 100,
    xpOrbOffset: 80,
    xp: 171,
    combatant: {
      name: 'Stone Tortoise',
      maxHp: 105,
      weapon: { name: 'Basic Attack', damage: 4, cooldown: 3000 },
      skills: [
        {
          id: 'stone-shell',
          name: 'Stone Shell',
          category: 'guard',
          cooldown: 5000,
          startsReady: true,
          effects: [{ type: 'def', amount: 8 }],
        },
      ],
    },
  },
  {
    image: '/enemies/cave/ankylosaur.webp',
    spriteScale: 0.9,
    spriteGroundOffset: -8,
    xpOrbRadius: 80,
    xpOrbOffset: 100,
    xp: 540,
    combatant: {
      name: 'Ankylosaur',
      maxHp: 232,
      weapon: { name: 'Basic Attack', damage: 8, cooldown: 3000 },
      skills: [
        {
          id: 'harden',
          name: 'Harden',
          category: 'guard',
          cooldown: 6000,
          startsReady: true,
          effects: [{ type: 'def', amount: 14 }],
        },
        {
          id: 'spiked-tail',
          name: 'Spiked Tail',
          category: 'attack',
          cooldown: 9000,
          effects: [
            { type: 'dmg', amount: 16 },
            { type: 'bleed', amountPerTick: 4, tickInterval: 1000, duration: 4000 },
          ],
        },
      ],
    },
  },
  {
    image: '/enemies/cave/cave-mantis.webp',
    spriteScale: 0.75,
    spriteGroundOffset: 15,
    xpOrbRadius: 80,
    xpOrbOffset: 90,
    xp: 189,
    combatant: {
      name: 'Cave Mantis',
      maxHp: 133,
      weapon: { name: 'Basic Attack', damage: 2, hits: 2, cooldown: 1800 },
      skills: [
        {
          id: 'flurry',
          name: 'Flurry',
          category: 'attack',
          cooldown: 6500,
          effects: [
            { type: 'dmg', amount: 4 },
            { type: 'dmg', amount: 4 },
            { type: 'dmg', amount: 4 },
          ],
        },
      ],
    },
  },
  {
    image: '/enemies/cave/sauropod.webp',
    spriteScale: 1,
    spriteGroundOffset: 1,
    xpOrbRadius: 100,
    xpOrbOffset: 150,
    xp: 567,
    combatant: {
      name: 'Sauropod',
      maxHp: 352,
      weapon: { name: 'Basic Attack', damage: 14, cooldown: 4000 },
      skills: [
        {
          id: 'stomp',
          name: 'Stomp',
          category: 'attack',
          cooldown: 10000,
          effects: [
            { type: 'stun', duration: 1800 },
            { type: 'dmg', amount: 34 },
          ],
        },
      ],
    },
  },
]
