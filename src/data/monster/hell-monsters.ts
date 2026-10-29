import type { Monster } from '@/types/monster.ts'

export const hellMonsters: Monster[] = [
  {
    image: '/enemies/hell/leukocyte.webp',
    spriteScale: 0.35,
    spriteGroundOffset: 145,
    xpOrbRadius: 80,
    xpOrbOffset: 40,
    xp: 13122,
    combatant: {
      name: 'Leukocyte',
      maxHp: 792,
      weapon: { name: 'Basic Attack', damage: 22, cooldown: 2800 },
      skills: [
        {
          id: 'cellular-renewal',
          name: 'Cellular Renewal',
          category: 'heal',
          cooldown: 12000,
          effects: [{ type: 'heal', amount: 44, duration: 4000 }],
        },
      ],
    },
  },
  {
    image: '/enemies/hell/abomination.webp',
    spriteScale: 1.5,
    spriteGroundOffset: 20,
    spriteWallOffset: -30,
    xpOrbRadius: 160,
    xpOrbOffset: 100,
    xp: 13851,
    combatant: {
      name: 'Abomination',
      maxHp: 858,
      weapon: { name: 'Basic Attack', damage: 7, hits: 3, cooldown: 2400 },
      skills: [
        {
          id: 'many-armed-flurry',
          name: 'Many-Armed Flurry',
          category: 'attack',
          cooldown: 8000,
          effects: Array.from({ length: 6 }, () => ({ type: 'dmg' as const, amount: 7 })),
        },
      ],
    },
  },
  {
    image: '/enemies/hell/watcher.webp',
    xp: 14580,
    xpOrbRadius: 100,
    xpOrbOffset: 160,
    combatant: {
      name: 'Watcher',
      maxHp: 792,
      weapon: { name: 'Basic Attack', damage: 20, cooldown: 2800 },
      skills: [
        {
          id: 'unblinking-vigil',
          name: 'Unblinking Vigil',
          category: 'guard',
          cooldown: 8000,
          startsReady: true,
          effects: [{ type: 'agi', charges: 2 }],
        },
        {
          id: 'phase-out',
          name: 'Phase Out',
          category: 'guard',
          cooldown: 13000,
          effects: [{ type: 'invincible', duration: 2500 }],
        },
      ],
    },
  },
  {
    image: '/enemies/hell/wall-of-flesh.webp',
    spriteScale: 1.5,
    spriteGroundOffset: 10,
    xpOrbRadius: 100,
    xpOrbOffset: 160,
    xp: 15309,
    combatant: {
      name: 'Wall of Flesh',
      maxHp: 1870,
      weapon: { name: 'Basic Attack', damage: 35, cooldown: 2500 },
      skills: [
        {
          id: 'flesh-barrage',
          name: 'Flesh Barrage',
          category: 'attack',
          cooldown: 8000,
          effects: Array.from({ length: 5 }, () => ({ type: 'dmg' as const, amount: 12 })),
        },
        {
          id: 'festering-curse',
          name: 'Festering Curse',
          category: 'attack',
          cooldown: 12000,
          effects: [
            { type: 'bleed', amountPerTick: 13, tickInterval: 1000, duration: 4000 },
            { type: 'curse', healingReduction: 0.75, duration: 10000 },
          ],
        },
      ],
    },
  },
  {
    image: '/enemies/hell/angel.webp',
    spriteOverflow: true,
    spriteScale: 1.3,
    spriteGroundOffset: 70,
    xpOrbRadius: 100,
    xpOrbOffset: 90,
    xp: 18225,
    combatant: {
      name: 'Angel',
      maxHp: 880,
      weapon: { name: 'Basic Attack', damage: 68, cooldown: 3000 },
      skills: [
        {
          id: 'judgment',
          name: 'Divine Judgment',
          category: 'attack',
          initialDelay: 15000,
          cooldown: 18000,
          effects: [
            { type: 'dmg', amount: 240 },
            { type: 'stun', duration: 2000 },
          ],
        },
        {
          id: 'divine-restoration',
          name: 'Divine Restoration',
          category: 'heal',
          initialDelay: 12000,
          cooldown: 18000,
          effects: [{ type: 'heal', amount: 100 }],
        },
        {
          id: 'sacred-halo',
          name: 'Sacred Halo',
          category: 'guard',
          initialDelay: 10000,
          cooldown: 18000,
          effects: [{ type: 'invincible', duration: 5000 }],
        },
      ],
    },
  },
]
