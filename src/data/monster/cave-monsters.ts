import type { Monster } from '@/types/monster.ts'

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
    image: '/enemies/cave/scoprion.webp',
    spriteScale: 0.75,
    spriteGroundOffset: 15,
    xpOrbRadius: 90,
    xpOrbOffset: 80,
    xp: 180,
    combatant: {
      name: 'Cave Scorpion',
      maxHp: 119,
      weapon: { name: 'Basic Attack', damage: 4, cooldown: 2000 },
      skills: [
        {
          id: 'venomous-sting',
          name: 'Venomous Sting',
          category: 'attack',
          cooldown: 8000,
          effects: [
            { type: 'dmg', amount: 12 },
            { type: 'curse', healingReduction: 0.6, duration: 6000 },
          ],
        },
      ],
    },
  },
  {
    image: '/enemies/cave/mantis.webp',
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
    image: '/enemies/cave/golem.webp',
    spriteScale: 0.85,
    spriteGroundOffset: 15,
    xpOrbRadius: 80,
    xpOrbOffset: 100,
    xp: 225,
    combatant: {
      name: 'Stone Golem',
      maxHp: 217,
      weapon: { name: 'Basic Attack', damage: 17, cooldown: 3500 },
      skills: [
        {
          id: 'heavy-slam',
          name: 'Heavy Slam',
          category: 'attack',
          cooldown: 9000,
          effects: [
            { type: 'stun', duration: 1800 },
            { type: 'dmg', amount: 38 },
          ],
        },
      ],
    },
  },
]
